package com.skillbridge.service;

import com.skillbridge.dto.request.TaskRequest;
import com.skillbridge.dto.response.TaskResponse;
import com.skillbridge.entity.Project;
import com.skillbridge.entity.Task;
import com.skillbridge.entity.User;
import com.skillbridge.entity.enums.NotificationType;
import com.skillbridge.entity.enums.TaskStatus;
import com.skillbridge.exception.BadRequestException;
import com.skillbridge.exception.ForbiddenException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.ProjectRepository;
import com.skillbridge.repository.TaskRepository;
import com.skillbridge.repository.TeamMembershipRepository;
import com.skillbridge.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TaskService(
            TaskRepository taskRepository,
            ProjectRepository projectRepository,
            TeamMembershipRepository membershipRepository,
            UserRepository userRepository,
            NotificationService notificationService) {
        this.taskRepository = taskRepository;
        this.projectRepository = projectRepository;
        this.membershipRepository = membershipRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getProjectTasks(Long projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new ResourceNotFoundException("Project not found with ID: " + projectId);
        }
        return taskRepository.findByProjectIdWithUsers(projectId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getAssignedTasks(Long userId) {
        return taskRepository.findByAssigneeIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskResponse createTask(Long projectId, Long creatorId, TaskRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with ID: " + projectId));

        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Verify creator is member or owner
        if (!project.getOwner().getId().equals(creatorId) && !membershipRepository.existsByProjectIdAndUserId(projectId, creatorId)) {
            throw new ForbiddenException("Only project team members can create tasks");
        }

        User assignee = null;
        if (request.getAssigneeId() != null) {
            assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found with ID: " + request.getAssigneeId()));

            // Verify assignee is part of project team
            if (!project.getOwner().getId().equals(assignee.getId()) && !membershipRepository.existsByProjectIdAndUserId(projectId, assignee.getId())) {
                throw new BadRequestException("Task assignee must be a member of the project team");
            }
        }

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setCreator(creator);
        task.setAssignee(assignee);
        task.setPriority(request.getPriority());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO);
        task.setDueDate(request.getDueDate());

        Task saved = taskRepository.save(task);

        // Notify assignee if someone else assigned the task
        if (assignee != null && !assignee.getId().equals(creatorId)) {
            notificationService.createNotification(
                    assignee,
                    NotificationType.TASK_ASSIGNED,
                    "New Task Assigned",
                    creator.getFullName() + " assigned you a task: '" + saved.getTitle() + "' in project '" + project.getTitle() + "'.",
                    "/projects/" + project.getId()
            );
        }

        return mapToTaskResponse(saved);
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, Long userId, TaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        Project project = task.getProject();
        if (!project.getOwner().getId().equals(userId) && !membershipRepository.existsByProjectIdAndUserId(project.getId(), userId)) {
            throw new ForbiddenException("Only project team members can update tasks");
        }

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        task.setPriority(request.getPriority());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }
        task.setDueDate(request.getDueDate());

        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.getAssigneeId()));
            task.setAssignee(assignee);
        } else {
            task.setAssignee(null);
        }

        Task saved = taskRepository.save(task);
        return mapToTaskResponse(saved);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, Long userId, TaskStatus status) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        Project project = task.getProject();
        if (!project.getOwner().getId().equals(userId) && !membershipRepository.existsByProjectIdAndUserId(project.getId(), userId)) {
            throw new ForbiddenException("Only project team members can update task status");
        }

        task.setStatus(status);
        Task saved = taskRepository.save(task);

        // Notify project owner on completion if updater is not owner
        if (status == TaskStatus.COMPLETED && !project.getOwner().getId().equals(userId)) {
            User updater = userRepository.findById(userId).orElse(null);
            String name = updater != null ? updater.getFullName() : "A team member";
            notificationService.createNotification(
                    project.getOwner(),
                    NotificationType.TASK_STATUS_CHANGED,
                    "Task Completed",
                    name + " completed the task '" + task.getTitle() + "' in project '" + project.getTitle() + "'.",
                    "/projects/" + project.getId()
            );
        }

        return mapToTaskResponse(saved);
    }

    @Transactional
    public void deleteTask(Long taskId, Long userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        Project project = task.getProject();
        if (!project.getOwner().getId().equals(userId) && !task.getCreator().getId().equals(userId)) {
            throw new ForbiddenException("Only the project owner or task creator can delete this task");
        }

        taskRepository.delete(task);
    }

    private TaskResponse mapToTaskResponse(Task task) {
        TaskResponse resp = new TaskResponse();
        resp.setId(task.getId());
        resp.setProjectId(task.getProject().getId());
        resp.setProjectTitle(task.getProject().getTitle());
        resp.setTitle(task.getTitle());
        resp.setDescription(task.getDescription());
        if (task.getAssignee() != null) {
            resp.setAssigneeId(task.getAssignee().getId());
            resp.setAssigneeName(task.getAssignee().getFullName());
            resp.setAssigneeEmail(task.getAssignee().getEmail());
        }
        resp.setCreatorId(task.getCreator().getId());
        resp.setCreatorName(task.getCreator().getFullName());
        resp.setStatus(task.getStatus());
        resp.setPriority(task.getPriority());
        resp.setDueDate(task.getDueDate());
        resp.setCreatedAt(task.getCreatedAt());
        resp.setUpdatedAt(task.getUpdatedAt());
        return resp;
    }
}
