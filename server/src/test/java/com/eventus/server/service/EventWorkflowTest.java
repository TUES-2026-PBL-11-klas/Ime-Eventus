package com.eventus.server.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.eventus.server.dto.approval.ApprovalResponse;
import com.eventus.server.dto.event.EventRequest;
import com.eventus.server.dto.event.EventResponse;
import com.eventus.server.entity.ApprovalRequest;
import com.eventus.server.entity.ApprovalStatus;
import com.eventus.server.entity.Event;
import com.eventus.server.entity.EventStatus;
import com.eventus.server.entity.EventStatusHistory;
import com.eventus.server.entity.User;
import com.eventus.server.exception.BadRequestException;
import com.eventus.server.repository.ApprovalRequestRepository;
import com.eventus.server.repository.EventCategoryRepository;
import com.eventus.server.repository.EventRepository;
import com.eventus.server.repository.EventStatusHistoryRepository;
import com.eventus.server.repository.RegistrationRepository;
import com.eventus.server.repository.RoomRepository;
import com.eventus.server.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class EventWorkflowTest {

    // ── EventService mocks ───────────────────────────────────────────────────────
    @Mock private EventRepository eventRepository;
    @Mock private EventCategoryRepository categoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private RoomRepository roomRepository;
    @Mock private RegistrationRepository registrationRepository;
    @Mock private NotificationService notificationService;
    @Mock private EventStatusHistoryRepository statusHistoryRepository;

    @InjectMocks private EventService eventService;

    // ── ApprovalService mocks ────────────────────────────────────────────────────
    @Mock private ApprovalRequestRepository approvalRequestRepository;

    private ApprovalService approvalService;

    private UUID teacherId;
    private UUID coordinatorId;
    private User teacher;
    private User coordinator;
    private Event event;
    private UUID eventId;

    @BeforeEach
    void setUp() {
        approvalService = new ApprovalService(
                approvalRequestRepository,
                eventRepository,
                userRepository,
                eventService
        );

        teacherId = UUID.randomUUID();
        coordinatorId = UUID.randomUUID();
        eventId = UUID.randomUUID();

        teacher = new User();
        teacher.setId(teacherId);
        teacher.setEmail("teacher@school.com");
        teacher.setFullName("Test Teacher");

        coordinator = new User();
        coordinator.setId(coordinatorId);
        coordinator.setEmail("coord@school.com");
        coordinator.setFullName("Test Coordinator");

        event = new Event();
        event.setId(eventId);
        event.setTitle("Test Workshop");
        event.setStatus(EventStatus.DRAFT);
        event.setOrganizer(teacher);
        event.setCapacity(30);
        event.setStartAt(LocalDateTime.now().plusDays(7));
        event.setEndAt(LocalDateTime.now().plusDays(7).plusHours(2));
    }

    // ── Step 1: Create event (DRAFT) ─────────────────────────────────────────────

    @Test
    void step1_createEvent_savesAsDraftAndRecordsHistory() {
        EventRequest request = buildRequest(EventStatus.DRAFT);

        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(eventRepository.save(any())).thenAnswer(inv -> {
            Event e = inv.getArgument(0);
            e.setId(eventId);
            return e;
        });
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EventResponse response = eventService.createEvent(request, teacherId);

        assertThat(response.getStatus()).isEqualTo(EventStatus.DRAFT);

        ArgumentCaptor<EventStatusHistory> historyCaptor = ArgumentCaptor.forClass(EventStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        EventStatusHistory history = historyCaptor.getValue();
        assertThat(history.getFromStatus()).isNull();
        assertThat(history.getToStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(history.getChangedBy()).isEqualTo(teacher);
    }

    // ── Step 2: Submit for approval (DRAFT → PENDING_APPROVAL) ──────────────────

    @Test
    void step2_submitForApproval_transitionsToPendingAndRecordsHistory() {
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(approvalRequestRepository.existsByEventIdAndStatus(eventId, ApprovalStatus.PENDING))
                .thenReturn(false);

        ApprovalRequest savedRequest = new ApprovalRequest();
        savedRequest.setId(UUID.randomUUID());
        savedRequest.setEvent(event);
        savedRequest.setSubmittedBy(teacher);
        when(approvalRequestRepository.save(any())).thenReturn(savedRequest);
        when(eventRepository.save(any())).thenReturn(event);
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        ApprovalResponse response = approvalService.submit(eventId, teacherId);

        assertThat(event.getStatus()).isEqualTo(EventStatus.PENDING_APPROVAL);

        ArgumentCaptor<EventStatusHistory> historyCaptor = ArgumentCaptor.forClass(EventStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        EventStatusHistory history = historyCaptor.getValue();
        assertThat(history.getFromStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(history.getToStatus()).isEqualTo(EventStatus.PENDING_APPROVAL);
    }

    @Test
    void step2_submitForApproval_throwsWhenNotDraft() {
        event.setStatus(EventStatus.PENDING_APPROVAL);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));

        assertThatThrownBy(() -> approvalService.submit(eventId, teacherId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("DRAFT");
    }

    @Test
    void step2_submitForApproval_throwsWhenNotOrganizer() {
        UUID otherId = UUID.randomUUID();
        User other = new User();
        other.setId(otherId);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findById(otherId)).thenReturn(Optional.of(other));

        assertThatThrownBy(() -> approvalService.submit(eventId, otherId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("organizer");
    }

    // ── Step 3: Approve (PENDING_APPROVAL → APPROVED) ───────────────────────────

    @Test
    void step3_approve_transitionsToApprovedAndRecordsHistory() {
        event.setStatus(EventStatus.PENDING_APPROVAL);

        ApprovalRequest approvalRequest = new ApprovalRequest();
        approvalRequest.setId(UUID.randomUUID());
        approvalRequest.setEvent(event);
        approvalRequest.setSubmittedBy(teacher);
        approvalRequest.setStatus(ApprovalStatus.PENDING);

        when(approvalRequestRepository.findById(approvalRequest.getId()))
                .thenReturn(Optional.of(approvalRequest));
        when(userRepository.findById(coordinatorId)).thenReturn(Optional.of(coordinator));
        when(eventRepository.save(any())).thenReturn(event);
        when(approvalRequestRepository.save(any())).thenReturn(approvalRequest);
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        approvalService.approve(approvalRequest.getId(), coordinatorId);

        assertThat(event.getStatus()).isEqualTo(EventStatus.APPROVED);
        assertThat(approvalRequest.getStatus()).isEqualTo(ApprovalStatus.APPROVED);
        assertThat(approvalRequest.getReviewedBy()).isEqualTo(coordinator);

        ArgumentCaptor<EventStatusHistory> historyCaptor = ArgumentCaptor.forClass(EventStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getToStatus()).isEqualTo(EventStatus.APPROVED);
    }

    // ── Step 4: Publish (APPROVED → PUBLISHED) ───────────────────────────────────

    @Test
    void step4_publish_transitionsToPublishedAndRecordsHistory() {
        event.setStatus(EventStatus.APPROVED);

        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(eventRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        eventService.publishEvent(eventId, teacherId);

        assertThat(event.getStatus()).isEqualTo(EventStatus.PUBLISHED);
        assertThat(event.getPublishedAt()).isNotNull();

        ArgumentCaptor<EventStatusHistory> historyCaptor = ArgumentCaptor.forClass(EventStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        EventStatusHistory history = historyCaptor.getValue();
        assertThat(history.getFromStatus()).isEqualTo(EventStatus.APPROVED);
        assertThat(history.getToStatus()).isEqualTo(EventStatus.PUBLISHED);
    }

    @Test
    void step4_publish_throwsWhenNotApproved() {
        event.setStatus(EventStatus.DRAFT);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));

        assertThatThrownBy(() -> eventService.publishEvent(eventId, teacherId))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("approved");
    }

    // ── Full chained workflow ────────────────────────────────────────────────────

    @Test
    void fullWorkflow_create_submit_approve_publish_recordsFourHistoryEntries() {
        // --- Create ---
        EventRequest request = buildRequest(EventStatus.DRAFT);
        when(userRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(eventRepository.save(any())).thenAnswer(inv -> {
            Event e = inv.getArgument(0);
            if (e.getId() == null) e.setId(eventId);
            return e;
        });
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        eventService.createEvent(request, teacherId);

        // --- Submit ---
        event.setStatus(EventStatus.DRAFT);
        when(eventRepository.findById(eventId)).thenReturn(Optional.of(event));
        when(approvalRequestRepository.existsByEventIdAndStatus(eventId, ApprovalStatus.PENDING))
                .thenReturn(false);

        ApprovalRequest savedReq = new ApprovalRequest();
        savedReq.setId(UUID.randomUUID());
        savedReq.setEvent(event);
        savedReq.setSubmittedBy(teacher);
        when(approvalRequestRepository.save(any())).thenReturn(savedReq);

        approvalService.submit(eventId, teacherId);

        // --- Approve ---
        event.setStatus(EventStatus.PENDING_APPROVAL);
        savedReq.setStatus(ApprovalStatus.PENDING);
        when(approvalRequestRepository.findById(savedReq.getId())).thenReturn(Optional.of(savedReq));
        when(userRepository.findById(coordinatorId)).thenReturn(Optional.of(coordinator));
        when(approvalRequestRepository.save(any())).thenReturn(savedReq);

        approvalService.approve(savedReq.getId(), coordinatorId);

        // --- Publish ---
        event.setStatus(EventStatus.APPROVED);

        eventService.publishEvent(eventId, teacherId);

        // Verify 4 total history saves: DRAFT, PENDING_APPROVAL, APPROVED, PUBLISHED
        verify(statusHistoryRepository, times(4)).save(any(EventStatusHistory.class));
    }

    // ── Reject path ─────────────────────────────────────────────────────────────

    @Test
    void reject_revertsEventToDraftAndRecordsHistory() {
        event.setStatus(EventStatus.PENDING_APPROVAL);

        ApprovalRequest approvalRequest = new ApprovalRequest();
        approvalRequest.setId(UUID.randomUUID());
        approvalRequest.setEvent(event);
        approvalRequest.setSubmittedBy(teacher);
        approvalRequest.setStatus(ApprovalStatus.PENDING);

        when(approvalRequestRepository.findById(approvalRequest.getId()))
                .thenReturn(Optional.of(approvalRequest));
        when(userRepository.findById(coordinatorId)).thenReturn(Optional.of(coordinator));
        when(eventRepository.save(any())).thenReturn(event);
        when(approvalRequestRepository.save(any())).thenReturn(approvalRequest);
        when(statusHistoryRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        approvalService.reject(approvalRequest.getId(), coordinatorId, "Missing details");

        assertThat(event.getStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(approvalRequest.getRejectionReason()).isEqualTo("Missing details");

        ArgumentCaptor<EventStatusHistory> historyCaptor = ArgumentCaptor.forClass(EventStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getToStatus()).isEqualTo(EventStatus.DRAFT);
        assertThat(historyCaptor.getValue().getReason()).contains("Missing details");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    private EventRequest buildRequest(EventStatus status) {
        EventRequest req = new EventRequest();
        req.setTitle("Test Workshop");
        req.setStatus(status);
        req.setOrganizerId(teacherId);
        req.setStartAt(LocalDateTime.now().plusDays(7));
        req.setEndAt(LocalDateTime.now().plusDays(7).plusHours(2));
        req.setCapacity(30);
        req.setAllowWaitlist(true);
        return req;
    }
}
