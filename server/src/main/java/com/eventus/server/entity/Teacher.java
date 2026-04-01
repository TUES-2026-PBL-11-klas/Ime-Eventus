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
@DiscriminatorValue("TEACHER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Teacher extends User {

    @OneToMany(mappedBy = "organizer", fetch = FetchType.LAZY)
    private Set<Event> organizedEvents = new HashSet<>();
}
