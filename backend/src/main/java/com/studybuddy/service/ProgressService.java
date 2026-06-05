package com.studybuddy.service;

import com.studybuddy.model.Progress;
import com.studybuddy.model.User;
import com.studybuddy.repository.ProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class ProgressService {

    @Autowired
    private ProgressRepository progressRepository;

    public Progress getOrCreateProgress(@NonNull User user) {
        return progressRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Progress newProgress = Objects.requireNonNull(Progress.builder()
                            .user(user)
                            .quizzesCompleted(0)
                            .averageScore(0.0)
                            .totalStudyTime(0L)
                            .build(), "newProgress");
                    return progressRepository.save(newProgress);
                });
    }

    @Transactional
    public Progress updateProgress(User user, int newScore, long additionalStudyTime) {
        Progress progress = getOrCreateProgress(Objects.requireNonNull(user, "user"));
        
        int currentCount = progress.getQuizzesCompleted();
        double currentAverage = progress.getAverageScore();
        
        // Calculate new average
        double newAverage = ((currentAverage * currentCount) + newScore) / (currentCount + 1);
        
        progress.setQuizzesCompleted(currentCount + 1);
        progress.setAverageScore(Math.round(newAverage * 10.0) / 10.0); // round to 1 decimal place
        progress.setTotalStudyTime(progress.getTotalStudyTime() + additionalStudyTime);
        
        return progressRepository.save(progress);
    }
}
