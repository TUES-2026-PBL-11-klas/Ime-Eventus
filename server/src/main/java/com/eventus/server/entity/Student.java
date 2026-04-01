package com.eventus.server.entity;

import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("STUDENT")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Student extends User {

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private Set<Registration> registrations = new HashSet<>();

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private Set<WaitlistEntry> waitlistEntries = new HashSet<>();

    @OneToMany(mappedBy = "student", fetch = FetchType.LAZY)
    private Set<AttendanceRecord> attendanceRecords = new HashSet<>();
}
