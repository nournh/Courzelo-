import {Component, OnDestroy, OnInit, Pipe, PipeTransform} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {DomSanitizer} from '@angular/platform-browser';
import {SessionStorageService} from '../../../shared/services/user/session-storage.service';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, Validators} from '@angular/forms';
import {ClassroomService} from '../../../shared/services/institution/classroom.service';
import {UserResponse} from '../../../shared/models/user/UserResponse';
import {ClassRoomResponse} from '../../../shared/models/institution/ClassRoomResponse';
import {AuthenticationService} from '../../../shared/services/user/authentication.service';
import {Subscription} from 'rxjs';
import {ClassRoomRequest} from '../../../shared/models/institution/ClassRoomRequest';
import {UserService} from '../../../shared/services/user/user.service';
import {ClassRoomPostRequest} from '../../../shared/models/institution/ClassRoomPostRequest';
import {QuestionType} from '../../../shared/models/QuestionType';
import {Quiz, StudentQuizAnswers} from '../../../shared/models/Quiz';
import {Question} from '../../../shared/models/Question';
import {QuizService} from '../../../shared/services/quiz.service';
import {CourseService} from '../../../shared/services/institution/course.service';
@Pipe({
    standalone: true,
    name: 'timeRemaining'
})
export class TimeRemainingPipe implements PipeTransform {
    transform(value: number): string {
        const minutes: number = Math.floor(value / 60);
        const seconds: number = value % 60;
        return `${this.pad(minutes)}:${this.pad(seconds)}`;
    }

    private pad(num: number): string {
        return num < 10 ? '0' + num : num.toString();
    }
}
@Component({
  selector: 'app-course',
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.scss']
})
export class ClassroomComponent implements OnInit, OnDestroy {
  constructor(
      private authenticationService: AuthenticationService,
      private route: ActivatedRoute,
      private router: Router,
      private toastr: ToastrService,
      private sessionstorage: SessionStorageService,
      private modalService: NgbModal,
      private formBuilder: FormBuilder,
      private courseService: ClassroomService,
      private userService: UserService,
      private sanitizer: DomSanitizer,
        private quizService: QuizService,
      private moduleService: CourseService
  ) { }
    quizToAdd: Quiz = {
        id: '',
        userEmail: '',
        title: '',
        description: '',
        questions: [],
        duration: 0,
        course: null,
        showSummary: false,
        finalScore: 0,
        maxScore: 0,
        quizStarted: false,
        quizEnded: false,
        timeRemaining: 0
    };
    selectedAnswers: { [quizID: string]: { [questionId: string]: string[] | string } } = {};
    quizSubmissionStatus: { [key: string]: boolean } = {};
    selectedQuiz: Quiz;
  classroomID: string;
  user: UserResponse;
  classRoom: ClassRoomResponse;
  classRoomRequest: ClassRoomRequest;
  postRequest: ClassRoomPostRequest = {} as ClassRoomPostRequest;
  files: File[] = [];
  loading = false;
    timer: any;
    doingQuiz = false;
    updateClassroomForm = this.formBuilder.group({
            name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            credit: [0, [Validators.required]],
        }
    );
    addPostForm = this.formBuilder.group({
            title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
            description: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    });
    private routeSub: Subscription;
    imageSrc: any;

    protected readonly QuestionType = QuestionType;
    ngOnInit(): void {
      this.sessionstorage.getUser().subscribe(
            user => {
              this.user = user;
            }
            );
        this.routeSub = this.route.params.subscribe(params => {
            this.classroomID = params['classroomID'];
            this.fetchClassroom();
        });
        if (this.classroomID == null || this.classroomID === '') {
            this.toastr.error('Classroom not found');
            this.router.navigateByUrl('dashboard/v1');
        }
  }
    ngOnDestroy(): void {
        if (this.routeSub) {
            this.routeSub.unsubscribe();
        }
    }
    startQuiz(quiz: any): void {
        this.doingQuiz = true;
        quiz.quizStarted = true;
        quiz.timeRemaining = quiz.duration * 60;
        console.log('Starting quiz:', quiz);
        this.timer = setInterval(() => {
            if (quiz.timeRemaining > 0) {
                quiz.timeRemaining--;
            } else {
                this.toastr.warning('Time is up!', 'Time');
                this.submitQuiz(quiz);
            }
        }, 1000);
    }
    canStartQuiz(quiz: Quiz) {
        return !(this.doingQuiz || quiz.quizStarted || quiz.quizEnded);
    }
    resetQuiz(quiz: Quiz): void {
        this.resetSelectAnswer(quiz);
        this.quizSubmissionStatus = {};
        quiz.showSummary = false;
        quiz.showSimplifiedSummary = false;
        quiz.finalScore = 0;
        this.startQuiz(quiz);
    }

    calculateScore(quiz: Quiz): void {
        let totalScore = 0;
        quiz.maxScore = 0;
            quiz.questions.forEach(question => {
                console.log(question);
                quiz.maxScore += question.points;
                if (question.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                    totalScore += question.points;
                }
            });
        quiz.finalScore = totalScore;
        this.toastr.success(`Your final score: ${quiz.finalScore}`, 'Score');
    }
    initializeSelectedAnswers(): void {
        this.classRoom.quizzes.forEach((quiz) => {
            this.selectedAnswers[quiz.id] = {};
            quiz.questions.forEach(question => {
                this.selectedAnswers[quiz.id][question.id] = '';
                console.log('Selected answers:', this.selectedAnswers);
            });
        });
    }
    resetSelectAnswer(quiz: Quiz) {
        this.selectedAnswers[quiz.id] = {};
        quiz.questions.forEach(question => {
            this.selectedAnswers[quiz.id][question.id] = '';
            console.log('Selected answers:', this.selectedAnswers);
        });
    }
    validateQuizAnswers(quiz: Quiz): boolean {
        return quiz.questions.every(question => {
            const answer = this.selectedAnswers[quiz.id]?.[question.id];
            console.log('Answer:', answer);
                return typeof answer === 'string' && answer.trim().length > 0;
        });
    }
    submitQuiz(quiz: Quiz): void {
        const currentQuiz = quiz;
        if (currentQuiz && currentQuiz.questions) {
            clearInterval(this.timer);
            this.doingQuiz = false;
            console.log('Submitting quiz:', currentQuiz);
            console.log('Selected answers:', this.selectedAnswers);
            this.quizSubmissionStatus[currentQuiz.id] = true;
            this.toastr.success('Quiz submitted successfully', 'Success');
             quiz.showSummary = true;
             this.calculateScore(quiz);
             this.saveStudentSubmission(quiz);
        }
    }
    saveStudentSubmission(quiz: Quiz): void {
        const studentQuizAnswers: StudentQuizAnswers = {
            questions: []
        };
        studentQuizAnswers.questions = quiz.questions;
        this.quizService.submitQuiz(quiz.id, studentQuizAnswers).subscribe(
            response => {
                console.log('Quiz submitted:', response);
            }, error => {
                console.error('Error submitting quiz:', error);
            }
        );
    }
    checkIfQuizSubmitted(quiz: Quiz): boolean {
        console.log('user:', this.user.email);
        console.log('student submissions:', quiz.studentSubmissions);
        return this.user.email === quiz.studentSubmissions.find(submission => submission.studentId === this.user.email)?.studentId;
    }
    trackByIndex(index: number, obj: any): any {
        return index;
    }
    addQuestion(): void {
        const newQuestion: Question = {
            id: '',
            text: '',
            options: [''],
            correctAnswer: '',
            type: QuestionType.MULTIPLE_CHOICE,
            answer: '',
            points: 0
        };
        this.quizToAdd.questions.push(newQuestion);
    }

    addOption(questionIndex: number): void {
        this.quizToAdd.questions[questionIndex].options.push('');
    }

    removeOption(questionIndex: number, optionIndex: number): void {
        this.quizToAdd.questions[questionIndex].options.splice(optionIndex, 1);
    }
    addQuiz(): void {
        if (this.quizIsValid(this.quizToAdd)) {
            this.quizToAdd.course = this.classroomID;
            this.quizService.saveQuiz(this.quizToAdd).subscribe(
                response => {
                    console.log('Quiz created:', response);
                    this.quizService.toastr.success('Quiz submitted successfully', 'Success');
                    this.quizToAdd = {
                        id: '',
                        userEmail: '',
                        title: '',
                        description: '',
                        questions: [],
                        duration: 0,
                        course: null,
                        showSummary: false,
                        finalScore: 0,
                        maxScore: 0,
                        quizStarted: false,
                        quizEnded: false,
                        timeRemaining: 0
                    };
                    this.fetchClassroom();
                },
                error => {
                    console.error('Error creating quiz:', error);
                }
            );
        } else {
            this.toastr.error('Please fill all fields correctly');
        }
    }
    quizIsValid(quiz: Quiz) {
        const title: boolean = quiz.title && quiz.title.trim().length > 0 && quiz.title.trim().length <= 50;
        const description: boolean = quiz.description && quiz.description.trim().length > 0 && quiz.description.trim().length <= 100;
        const duration: boolean = quiz.duration > 0;
        const questions: boolean = quiz.questions.length > 0;
        const questionsValid: boolean = quiz.questions.every(question => {
            const text: boolean = question.text && question.text.trim().length > 0;
            const options: boolean = question.options.length > 0;
            const correctAnswer: boolean = question.correctAnswer && question.correctAnswer.trim().length > 0 &&
                question.correctAnswer.trim().length <= 50 &&
            question.type === QuestionType.MULTIPLE_CHOICE ? question.options.includes(question.correctAnswer) : true;
            const points: boolean = question.points > 0;
            return text && options && correctAnswer && points;
        });
        return title && description && duration && questions && questionsValid;
    }
    addQuizModel(content) {
        this.modalService.open( content, { ariaLabelledBy: 'add Quiz', backdrop: false })
            .result.then((result) => {
                this.quizToAdd = {
                    id: '',
                    userEmail: '',
                    title: '',
                    description: '',
                    questions: [],
                    duration: 0,
                    course: null,
                    showSummary: false,
                    finalScore: 0,
                    quizStarted: false,
                    quizEnded: false,
                    timeRemaining: 0
                }; }, (reason) => {
            console.log('Err!', reason);
        });
    }
    resetForm(): void {
this.quizToAdd = {
    id: '',
    userEmail: '',
    title: '',
    description: '',
    questions: [],
    duration: 0,
    course: null,
    showSummary: false,
    finalScore: 0,
    quizStarted: false,
    quizEnded: false,
    timeRemaining: 0
};

}
    fetchClassroom() {
        this.courseService.getClassroom(this.classroomID).subscribe(
            course => {
                this.classRoom = course;
                if (this.classRoom.course) {
                    this.moduleService.getCourse(this.classRoom.course).subscribe(module => {
                        this.classRoom.name = module.name;
                        this.classRoom.description = module.description;
                        this.classRoom.credit = module.credit;
                    });

                }
                if (this.classRoom.posts) {
                    this.classRoom.posts.forEach(post => {
                        if (Array.isArray(post.created)) {
                            const [year, month, day, hour, minute, second, nanosecond] = post.created;
                            post.created = new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
                        }
                    });
                }
                console.log(this.classRoom);

                if (this.classRoom.teacher) {
                    this.userService.getProfileImageBlobUrl(course.teacher).subscribe((blob: Blob) => {
                        const objectURL = URL.createObjectURL(blob);
                        this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(objectURL);
                    });
                }
                if (this.classRoom.quizzes) {
                    this.classRoom.quizzes.forEach(quiz => {
                        if (Array.isArray(quiz.createdAt)) {
                            const [year, month, day, hour, minute, second, nanosecond] = quiz.createdAt;
                            quiz.createdAt = new Date(year, month - 1, day, hour, minute, second, nanosecond / 1000000);
                        }
                    });
                    this.initializeSelectedAnswers();
                    if (this.classRoom.quizzes) {
                        this.classRoom.quizzes.forEach(quiz => {
                            if (this.checkIfQuizSubmitted(quiz)) {
                                quiz.showSummary = false;
                                quiz.showSimplifiedSummary = true;
                                quiz.quizEnded = true;
                                quiz.finalScore = quiz.studentSubmissions.find(submission =>
                                    submission.studentId === this.user.email)?.score;
                                quiz.maxScore = quiz.questions.reduce((acc, question) => acc + question.points, 0);
                            }
                        });
                    }
                }
            }, error => {
                console.error('Error fetching course:', error);
                this.toastr.error(error.error);
                this.router.navigateByUrl('dashboard/v1');
            }
        );
    }
    deleteClassroom(content: any) {
        this.modalService.open(content, { ariaLabelledBy: 'delete course', backdrop: false })
            .result.then((result) => {
            if (result === 'Ok') {
                this.courseService.deleteClassroom(this.classroomID).subscribe(
                    () => {
                        this.toastr.success('Classroom deleted successfully');
                        this.authenticationService.refreshPageInfo();
                        this.router.navigateByUrl('dashboard/v1');
                    }, error => {
                        this.toastr.error('Error deleting course');
                    }
                );
            }
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
    deletePostModal(content: any, postID: string) {
        this.modalService.open(content, { ariaLabelledBy: 'delete post', backdrop: false })
            .result.then((result) => {
            if (result === 'Ok') {
                this.deletePost(postID);
            }
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
    deleteQuizModal(content: any, quizID: string) {
        this.modalService.open(content, { ariaLabelledBy: 'delete post', backdrop: false })
            .result.then((result) => {
            if (result === 'Ok') {
                this.deleteQuiz(quizID);
            }
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
    quizSubmissionsModal(content: any, quiz: Quiz) {
        if (quiz.studentSubmissions) {
            this.selectedQuiz = quiz;
            this.modalService.open(content, {ariaLabelledBy: 'quiz submissions', backdrop: false})
                .result.then((result) => {
                console.log(result);
            }, (reason) => {
                console.log('Err!', reason);
            });
        } else {
            this.toastr.error('No submissions found');
        }
    }
    isUserTeacherInClassroom(): boolean {
        return this.classRoom.teacher === this.user.email;
    }
    shouldShowErrorUpdateClassroom(controlName: string, errorName: string): boolean {
        const control = this.updateClassroomForm.get(controlName);
        return control && control.errors && control.errors[errorName] && (control.dirty || control.touched);
    }
    shouldShowErrorAddPost(controlName: string, errorName: string): boolean {
        const control = this.addPostForm.get(controlName);
        return control && control.errors && control.errors[errorName] && (control.dirty || control.touched);
    }
    updateClassroomModel(content) {
        this.updateClassroomForm.patchValue({
            name: this.classRoom.name,
            description: this.classRoom.description,
            credit: this.classRoom.credit
        });
        this.modalService.open( content, { ariaLabelledBy: 'Update Classroom' , backdrop: false})
            .result.then((result) => {
            console.log(result);
        }, (reason) => {
            console.log('Err!', reason);
        });
    }

    updateClassroom() {
        this.loading = true;
        if (this.updateClassroomForm.valid) {
            this.classRoomRequest = this.updateClassroomForm.getRawValue();
            this.courseService.updateClassroom(this.classroomID, this.classRoomRequest).subscribe(
                () => {
                    this.toastr.success('Classroom updated successfully');
                    this.fetchClassroom();
                    this.loading = false;
                }, error => {
                    console.error('Error updating course:', error);
                    this.toastr.error('Error updating course');
                    this.loading = false;
                }
            );
        } else {
            this.toastr.error('Please fill all fields correctly');
            this.loading = false;
        }
    }
    addPostModel(content) {
        this.modalService.open( content, { ariaLabelledBy: 'add Post', backdrop: false })
            .result.then((result) => {
            console.log(result);
        }, (reason) => {
            console.log('Err!', reason);
        });
    }
    addPost() {
        this.loading = true;
        if (this.addPostForm.valid) {
            this.postRequest.title = this.addPostForm.controls['title'].value;
            this.postRequest.description = this.addPostForm.controls['description'].value;
            console.log(this.postRequest);
            this.courseService.addPost(this.classroomID, this.postRequest, this.files).subscribe(
                () => {
                    this.toastr.success('Post added successfully');
                    this.fetchClassroom();
                    this.loading = false;
                    this.addPostForm.reset();
                    this.files = [];
                }, error => {
                    console.error('Error adding post:', error);
                    this.toastr.error('Error adding post');
                    this.loading = false;
                    this.files = [];
                }
            );
        } else {
            this.toastr.error('Please fill all fields correctly');
            this.loading = false;
        }
    }
    downloadFile(fileName: string) {
        this.courseService.downloadFile(this.classroomID, fileName).subscribe(
            response => {
                const blob = new Blob([response]);

                // Create a link element
                const link = document.createElement('a');

                // Set the download attribute with the filename
                link.href = window.URL.createObjectURL(blob);
                link.download = fileName;

                // Append the link to the body
                document.body.appendChild(link);

                // Programmatically click the link to trigger the download
                link.click();

                // Clean up by removing the link from the document
                document.body.removeChild(link);

                // Revoke the object URL to release memory
                window.URL.revokeObjectURL(link.href);
            }, error => {
                console.error('Error downloading file:', error);
                this.toastr.error('Error downloading file');
            });
    }

    onFileSelected(event) {
        this.files = [];
        if (event.target.files.length > 0) {
            for (let i = 0; i < event.target.files.length; i++) {
                this.files.push(event.target.files[i]);
            }
        }
    }
    deletePost(postID: string) {
        this.courseService.deletePost(this.classroomID, postID).subscribe(
            () => {
                this.toastr.success('Post deleted successfully');
                this.fetchClassroom();
            }, error => {
                console.error('Error deleting post:', error);
                this.toastr.error('Error deleting post');
            }
        );
    }
    deleteQuiz(quizID: string) {
        this.quizService.deleteQuiz(quizID, this.classroomID).subscribe(
            () => {
                this.toastr.success('Quiz deleted successfully');
                this.fetchClassroom();
            }, error => {
                console.error('Error deleting quiz:', error);
                this.toastr.error('Error deleting quiz');
            }
        );
    }
}
