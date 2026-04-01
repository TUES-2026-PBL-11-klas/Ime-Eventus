package com.eventus.server.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventus.server.dto.category.CategoryRequest;
import com.eventus.server.dto.category.CategoryResponse;
import com.eventus.server.entity.EventCategory;
import com.eventus.server.exception.ResourceAlreadyExistsException;
import com.eventus.server.exception.ResourceNotFoundException;
import com.eventus.server.repository.EventCategoryRepository;

@Service
public class CategoryService {

    private final EventCategoryRepository categoryRepository;

    public CategoryService(EventCategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category", "name", request.getName());
        }

        EventCategory category = new EventCategory();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());
        category.setActive(true);

        EventCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (!category.getName().equals(request.getName()) && categoryRepository.existsByName(request.getName())) {
            throw new ResourceAlreadyExistsException("Category", "name", request.getName());
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setColor(request.getColor());

        EventCategory saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public void deactivateCategory(UUID id) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setActive(false);
        categoryRepository.save(category);
    }

    private CategoryResponse mapToResponse(EventCategory category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getDescription(),
                category.getColor(),
                category.isActive(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
