package com.skillbridge.config;

import com.skillbridge.entity.*;
import com.skillbridge.entity.enums.*;
import com.skillbridge.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final ProjectRepository projectRepository;
    private final ProjectSkillRequirementRepository requirementRepository;
    private final TeamMembershipRepository membershipRepository;
    private final TaskRepository taskRepository;
    private final LearningGoalRepository learningGoalRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            ProjectRepository projectRepository,
            ProjectSkillRequirementRepository requirementRepository,
            TeamMembershipRepository membershipRepository,
            TaskRepository taskRepository,
            LearningGoalRepository learningGoalRepository,
            NotificationRepository notificationRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.projectRepository = projectRepository;
        this.requirementRepository = requirementRepository;
        this.membershipRepository = membershipRepository;
        this.taskRepository = taskRepository;
        this.learningGoalRepository = learningGoalRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (skillRepository.count() == 0) {
            seedSkills();
        }

        if (userRepository.count() == 0) {
            seedUsersAndProjects();
        }
    }

    private void seedSkills() {
        logger.info("Seeding initial technology skills catalog...");

        List<Skill> skills = Arrays.asList(
                new Skill("Java", "Backend", "Object-oriented, class-based programming language for enterprise software"),
                new Skill("Spring Boot", "Backend", "Framework for building stand-alone production-grade Spring applications"),
                new Skill("React", "Frontend", "JavaScript library for building dynamic component-driven user interfaces"),
                new Skill("JavaScript", "Frontend", "High-level scripting language that powers interactive web interfaces"),
                new Skill("TypeScript", "Frontend", "Strongly typed superset of JavaScript that compiles to plain JavaScript"),
                new Skill("Python", "AI/Data", "Interpreted high-level general-purpose programming language for ML and web"),
                new Skill("MySQL", "Database", "Popular open-source relational database management system"),
                new Skill("PostgreSQL", "Database", "Advanced open-source relational and object-relational database"),
                new Skill("MongoDB", "Database", "Source-available cross-platform document-oriented database program"),
                new Skill("Docker", "DevOps", "Platform designed to build, share, and run containerized applications"),
                new Skill("Kubernetes", "DevOps", "Automated container orchestration and deployment platform"),
                new Skill("AWS", "Cloud", "Amazon Web Services cloud computing platform and microservices"),
                new Skill("Git", "Tools", "Distributed version control system for tracking changes in source code"),
                new Skill("Node.js", "Backend", "Asynchronous event-driven JavaScript runtime environment"),
                new Skill("Next.js", "Frontend", "React framework for production full-stack web applications"),
                new Skill("Tailwind CSS", "Frontend", "Utility-first CSS framework for rapid modern UI development"),
                new Skill("HTML/CSS", "Frontend", "Foundational web markup and styling standards"),
                new Skill("Redis", "Database", "In-memory data structure store used as a distributed cache and message broker")
        );

        skillRepository.saveAll(skills);
        logger.info("Successfully seeded {} skills.", skills.size());
    }

    private void seedUsersAndProjects() {
        logger.info("Seeding demo users, projects, skills, tasks, and learning goals...");

        // 1. Admin User
        User admin = new User("System Administrator", "admin@skillbridge.edu", passwordEncoder.encode("Admin@123"), Role.ROLE_ADMIN);
        admin.setBio("Platform Administrator overseeing system integrity and student safety.");
        admin.setEducation("M.S. in Computer Science");
        admin.setInterests("System Architecture, Cloud Infrastructure, Security");
        userRepository.save(admin);

        // 2. Student 1: Alex Turner (Full Stack Enthusiast)
        User alex = new User("Alex Turner", "alex@skillbridge.edu", passwordEncoder.encode("Student@123"), Role.ROLE_STUDENT);
        alex.setBio("Final-year Computer Science undergrad passionate about building scalable web platforms and cloud-native backends.");
        alex.setEducation("B.Tech in Computer Science & Engineering, 2026");
        alex.setInterests("Spring Boot, Microservices, Distributed Systems, Open Source");
        alex.setGithubUrl("https://github.com/alex-turner");
        alex.setLinkedinUrl("https://linkedin.com/in/alex-turner-cs");
        userRepository.save(alex);

        // 3. Student 2: Maya Lin (Frontend & UI/UX Specialist)
        User maya = new User("Maya Lin", "maya@skillbridge.edu", passwordEncoder.encode("Student@123"), Role.ROLE_STUDENT);
        maya.setBio("Frontend developer focused on accessible design systems, fluid motion design, and high-performance React architectures.");
        maya.setEducation("B.S. in Information Systems, 2026");
        maya.setInterests("React, TypeScript, Design Systems, Web Accessibility");
        maya.setGithubUrl("https://github.com/maya-lin");
        maya.setLinkedinUrl("https://linkedin.com/in/maya-lin-dev");
        userRepository.save(maya);

        // 4. Student 3: Devon Brooks (DevOps & Backend Engineer)
        User devon = new User("Devon Brooks", "devon@skillbridge.edu", passwordEncoder.encode("Student@123"), Role.ROLE_STUDENT);
        devon.setBio("Infrastructure and backend tinkerer enthusiastic about Docker containers, CI/CD pipelines, and database optimization.");
        devon.setEducation("B.Tech in Software Engineering, 2025");
        devon.setInterests("Docker, Kubernetes, PostgreSQL, Linux, Go");
        devon.setGithubUrl("https://github.com/devon-brooks");
        userRepository.save(devon);

        // Fetch skills
        Skill java = skillRepository.findByNameIgnoreCase("Java").orElseThrow();
        Skill springBoot = skillRepository.findByNameIgnoreCase("Spring Boot").orElseThrow();
        Skill react = skillRepository.findByNameIgnoreCase("React").orElseThrow();
        Skill js = skillRepository.findByNameIgnoreCase("JavaScript").orElseThrow();
        Skill ts = skillRepository.findByNameIgnoreCase("TypeScript").orElseThrow();
        Skill mysql = skillRepository.findByNameIgnoreCase("MySQL").orElseThrow();
        Skill docker = skillRepository.findByNameIgnoreCase("Docker").orElseThrow();
        Skill git = skillRepository.findByNameIgnoreCase("Git").orElseThrow();

        // Assign skills to Alex
        userSkillRepository.save(new UserSkill(alex, java, ProficiencyLevel.ADVANCED, 3.0));
        userSkillRepository.save(new UserSkill(alex, springBoot, ProficiencyLevel.ADVANCED, 2.5));
        userSkillRepository.save(new UserSkill(alex, mysql, ProficiencyLevel.INTERMEDIATE, 2.0));
        userSkillRepository.save(new UserSkill(alex, git, ProficiencyLevel.ADVANCED, 3.0));
        userSkillRepository.save(new UserSkill(alex, js, ProficiencyLevel.INTERMEDIATE, 1.5));

        // Assign skills to Maya
        userSkillRepository.save(new UserSkill(maya, react, ProficiencyLevel.ADVANCED, 3.0));
        userSkillRepository.save(new UserSkill(maya, ts, ProficiencyLevel.ADVANCED, 2.5));
        userSkillRepository.save(new UserSkill(maya, js, ProficiencyLevel.ADVANCED, 3.0));
        userSkillRepository.save(new UserSkill(maya, git, ProficiencyLevel.INTERMEDIATE, 2.0));

        // Assign skills to Devon
        userSkillRepository.save(new UserSkill(devon, docker, ProficiencyLevel.ADVANCED, 2.5));
        userSkillRepository.save(new UserSkill(devon, mysql, ProficiencyLevel.ADVANCED, 3.0));
        userSkillRepository.save(new UserSkill(devon, java, ProficiencyLevel.INTERMEDIATE, 2.0));

        // Seed Project 1 by Alex: CampusConnect
        Project p1 = new Project(
                "CampusConnect — Student Peer Mentorship Hub",
                "A unified campus portal where senior students conduct verified technical workshops, code reviews, and mock interview sessions for juniors.",
                alex,
                "Full Stack",
                ProjectDifficulty.INTERMEDIATE,
                4
        );
        p1.setDeadline(LocalDate.now().plusMonths(3));
        p1.setGithubRepoUrl("https://github.com/skillbridge/campus-connect");
        p1 = projectRepository.save(p1);

        // Project 1 requirements
        requirementRepository.save(new ProjectSkillRequirement(p1, springBoot, ProficiencyLevel.INTERMEDIATE, RequirementWeight.HIGH));
        requirementRepository.save(new ProjectSkillRequirement(p1, react, ProficiencyLevel.INTERMEDIATE, RequirementWeight.HIGH));
        requirementRepository.save(new ProjectSkillRequirement(p1, mysql, ProficiencyLevel.BEGINNER, RequirementWeight.MEDIUM));
        requirementRepository.save(new ProjectSkillRequirement(p1, docker, ProficiencyLevel.BEGINNER, RequirementWeight.LOW));

        // Team membership for Project 1
        membershipRepository.save(new TeamMembership(p1, alex, MembershipRole.OWNER));
        membershipRepository.save(new TeamMembership(p1, maya, MembershipRole.LEAD));

        // Tasks for Project 1
        taskRepository.save(new Task(p1, "Design REST API schema for peer reviews", "Define Swagger contracts and DTOs for the review endpoints.", alex, alex, TaskPriority.HIGH, LocalDate.now().plusWeeks(1)));
        taskRepository.save(new Task(p1, "Build responsive dashboard wireframes", "Implement theme tokens and mobile navigation drawer in React.", alex, maya, TaskPriority.MEDIUM, LocalDate.now().plusWeeks(2)));
        Task t3 = new Task(p1, "Set up Docker development environment", "Configure docker-compose with backend and MySQL containers.", alex, null, TaskPriority.LOW, LocalDate.now().plusWeeks(3));
        t3.setStatus(TaskStatus.COMPLETED);
        taskRepository.save(t3);

        // Project 2 by Maya: EcoTrack
        Project p2 = new Project(
                "EcoTrack — Campus Energy & Resource Analytics",
                "Real-time visual dashboard monitoring building energy consumption and solar output with interactive charts and automated conservation tips.",
                maya,
                "Data Science",
                ProjectDifficulty.ADVANCED,
                3
        );
        p2.setDeadline(LocalDate.now().plusMonths(4));
        p2 = projectRepository.save(p2);

        requirementRepository.save(new ProjectSkillRequirement(p2, react, ProficiencyLevel.ADVANCED, RequirementWeight.HIGH));
        requirementRepository.save(new ProjectSkillRequirement(p2, ts, ProficiencyLevel.INTERMEDIATE, RequirementWeight.HIGH));
        requirementRepository.save(new ProjectSkillRequirement(p2, docker, ProficiencyLevel.INTERMEDIATE, RequirementWeight.MEDIUM));

        membershipRepository.save(new TeamMembership(p2, maya, MembershipRole.OWNER));

        // Learning Goals for Alex
        LearningGoal g1 = new LearningGoal(alex, "Master React Hooks and Context", "Deep dive into state management patterns to become proficient in frontend collaboration.", react, "React", LocalDate.now().plusWeeks(4));
        g1.setStatus(GoalStatus.IN_PROGRESS);
        g1.setProgressPercentage(45);
        learningGoalRepository.save(g1);

        LearningGoal g2 = new LearningGoal(alex, "Learn Docker Container Orchestration", "Understand Dockerfile multi-stage builds and compose networks.", docker, "Docker", LocalDate.now().plusWeeks(8));
        g2.setStatus(GoalStatus.NOT_STARTED);
        g2.setProgressPercentage(10);
        learningGoalRepository.save(g2);

        // Notifications for Alex
        notificationRepository.save(new Notification(
                alex,
                NotificationType.SYSTEM_ALERT,
                "Welcome to SkillBridge!",
                "Your profile has been created. Start by setting your technical skills to discover matched projects.",
                "/profile"
        ));
        notificationRepository.save(new Notification(
                alex,
                NotificationType.INVITATION_ACCEPTED,
                "Maya joined CampusConnect",
                "Maya Lin accepted your invitation and joined CampusConnect as Frontend Lead.",
                "/projects/" + p1.getId()
        ));

        logger.info("Demo data successfully seeded!");
    }
}
