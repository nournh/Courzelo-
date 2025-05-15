import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PrehiringTestsService } from 'src/app/shared/services/Prehiringtests.service';
import { PsychotechnicTestsService } from 'src/app/shared/services/Psychotechic.service';
import { PrehiringTests, QuestionsBusiness } from 'src/app/shared/models/PrehiringTests';
import { PsychotechnicTest } from 'src/app/shared/models/PsychotechnicTest';
import { QuestionPsycho } from 'src/app/shared/models/questionpsycho';

@Component({
  selector: 'app-add-test',
  templateUrl: './add-test.component.html',
  styleUrls: ['./add-test.component.scss']
})
export class AddTestComponent implements OnInit {
  testForm: FormGroup;
  activeTab: 'prehiring' | 'psychotechnic' = 'prehiring';
  userId: string;
  businessId: string;
  prehiringTests: PrehiringTests[] = [];
  psychotechnicTests: PsychotechnicTest[] = [];
  loadingPrehiringTests: boolean = false;
  loadingPsychotechnicTests: boolean = false;
  errorLoadingPrehiring: string | null = null;
  errorLoadingPsychotechnic: string | null = null;
  showForm: boolean = false;
  editingTest: boolean = false;
  currentTestId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private prehiringTestsService: PrehiringTestsService,
    private psychotechnicTestsService: PsychotechnicTestsService
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.userId = user?.id;
    this.businessId = user?.businessId || user?.id;
    
    this.initializeForms();
    this.loadTests();
  }

  loadTests(): void {
    this.loadingPrehiringTests = true;
    this.errorLoadingPrehiring = null;
    this.prehiringTestsService.getTestsByBusiness(this.businessId).subscribe({
      next: (tests) => {
        this.prehiringTests = tests;
        this.loadingPrehiringTests = false;
      },
      error: (err) => {
        console.error('Failed to load prehiring tests:', err);
        this.errorLoadingPrehiring = 'Failed to load prehiring tests';
        this.loadingPrehiringTests = false;
      }
    });
  
    this.loadingPsychotechnicTests = true;
    this.errorLoadingPsychotechnic = null;
    this.psychotechnicTestsService.getTestsByBusiness(this.businessId).subscribe({
      next: (tests) => {
        this.psychotechnicTests = tests;
        this.loadingPsychotechnicTests = false;
      },
      error: (err) => {
        console.error('Failed to load psychotechnic tests:', err);
        this.errorLoadingPsychotechnic = 'Failed to load psychotechnic tests';
        this.loadingPsychotechnicTests = false;
      }
    });
  }

  initializeForms(): void {
    this.testForm = this.fb.group({
      prehiring: this.fb.group({
        title: ['', Validators.required],
        intro: ['', Validators.required],
        randomOrder: [false],
        questions: this.fb.array([this.createPrehiringQuestion()])
      }),
      psychotechnic: this.fb.group({
        title: ['', Validators.required],
        intro: ['', Validators.required],
        randomOrder: [false],
        questions: this.fb.array([this.createPsychotechnicQuestion()])
      })
    });
  }

  // Prehiring methods
  get prehiringQuestions(): FormArray {
    return (this.testForm.get('prehiring') as FormGroup).get('questions') as FormArray;
  }

  getPrehiringResponses(index: number): FormArray {
    return this.prehiringQuestions.at(index).get('responses') as FormArray;
  }

  createPrehiringQuestion(): FormGroup {
    return this.fb.group({
      questionLabel: ['', Validators.required],
      typeQ: ['Multiple choice', Validators.required],
      score: [10, [Validators.required, Validators.min(1)]],
      time: [1, [Validators.required, Validators.min(1)]],
      responses: this.fb.array([this.createResponse()])
    });
  }

  addPrehiringQuestion(): void {
    this.prehiringQuestions.push(this.createPrehiringQuestion());
  }

  // Psychotechnic methods
  get psychotechnicQuestions(): FormArray {
    return (this.testForm.get('psychotechnic') as FormGroup).get('questions') as FormArray;
  }

  getPsychotechnicQuestion(index: number): FormGroup {
    return this.psychotechnicQuestions.at(index) as FormGroup;
  }

  getPsychotechnicCorrectResponses(index: number): FormArray {
    return this.getPsychotechnicQuestion(index).get('correctResponses') as FormArray;
  }

  getPsychotechnicFalseResponses(index: number): FormArray {
    return this.getPsychotechnicQuestion(index).get('falseResponses') as FormArray;
  }
  createPsychotechnicQuestion(): FormGroup {
    return this.fb.group({
      questionpsychoLabel: ['', Validators.required],
      typeQ: ['', Validators.required],
      questionpsychoId: [null], // Set to null for new questions
      correctResponses: this.fb.array([this.createPsychoResponse()]),
      falseResponses: this.fb.array([this.createPsychoResponse()])
    });
  }
  createPsychoResponse(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required]
    });
  }

  addPsychotechnicQuestion(): void {
    this.psychotechnicQuestions.push(this.createPsychotechnicQuestion());
  }

  addPsychotechnicCorrectResponse(questionIndex: number): void {
    this.getPsychotechnicCorrectResponses(questionIndex).push(this.createPsychoResponse());
  }

  removePsychotechnicCorrectResponse(questionIndex: number, responseIndex: number): void {
    this.getPsychotechnicCorrectResponses(questionIndex).removeAt(responseIndex);
  }

  addPsychotechnicFalseResponse(questionIndex: number): void {
    this.getPsychotechnicFalseResponses(questionIndex).push(this.createPsychoResponse());
  }

  removePsychotechnicFalseResponse(questionIndex: number, responseIndex: number): void {
    this.getPsychotechnicFalseResponses(questionIndex).removeAt(responseIndex);
  }

  // Common methods
  createResponse(): FormGroup {
    return this.fb.group({
      label: ['', Validators.required],
      state: [false]
    });
  }

  addResponseToQuestion(index: number): void {
    this.getPrehiringResponses(index).push(this.createResponse());
  }

  removeResponseFromQuestion(questionIndex: number, responseIndex: number): void {
    this.getPrehiringResponses(questionIndex).removeAt(responseIndex);
  }

  removeQuestion(index: number): void {
    if (this.activeTab === 'prehiring') {
      this.prehiringQuestions.removeAt(index);
    } else {
      this.psychotechnicQuestions.removeAt(index);
    }
  }

  switchTab(tab: 'prehiring' | 'psychotechnic'): void {
    this.activeTab = tab;
    this.showForm = false;
    this.editingTest = false;
  }

  startNewPrehiringTest(): void {
    this.activeTab = 'prehiring';
    this.showForm = true;
    this.editingTest = false;
    this.currentTestId = null;
    this.testForm.get('prehiring')?.reset();
    while (this.prehiringQuestions.length > 0) {
      this.prehiringQuestions.removeAt(0);
    }
    this.prehiringQuestions.push(this.createPrehiringQuestion());
  }
  startNewPsychotechnicTest(): void {
    this.activeTab = 'psychotechnic';
    this.showForm = true;
    this.editingTest = false;
    this.currentTestId = null;
    
    // Reset the psychotechnic form group completely
    const psychotechnicForm = this.testForm.get('psychotechnic') as FormGroup;
    psychotechnicForm.reset({
      title: '',
      intro: '',
      randomOrder: false
    });
    
    // Clear existing questions
    while (this.psychotechnicQuestions.length > 0) {
      this.psychotechnicQuestions.removeAt(0);
    }
    
    // Add one empty question
    this.addPsychotechnicQuestion();
  }

  editPrehiringTest(test: PrehiringTests): void {
    this.activeTab = 'prehiring';
    this.showForm = true;
    this.editingTest = true;
    this.currentTestId = test.idPrehiringTest;
    
    const prehiringForm = this.testForm.get('prehiring') as FormGroup;
    prehiringForm.patchValue({
      title: test.title,
      intro: test.intro,
      randomOrder: test.randomOrder
    });

    while (this.prehiringQuestions.length > 0) {
      this.prehiringQuestions.removeAt(0);
    }

    test.questions.forEach(question => {
      const questionGroup = this.fb.group({
        questionLabel: [question.questionLabel, Validators.required],
        typeQ: [question.typeQ, Validators.required],
        score: [question.score, [Validators.required, Validators.min(1)]],
        time: [question.time, [Validators.required, Validators.min(1)]],
        responses: this.fb.array([])
      });

      const responsesArray = questionGroup.get('responses') as FormArray;
      
      question.correctResponses.forEach(response => {
        responsesArray.push(this.fb.group({
          label: [response, Validators.required],
          state: [true]
        }));
      });

      question.falseResponses.forEach(response => {
        responsesArray.push(this.fb.group({
          label: [response, Validators.required],
          state: [false]
        }));
      });

      this.prehiringQuestions.push(questionGroup);
    });
  }

  editPsychotechnicTest(test: PsychotechnicTest): void {
    this.activeTab = 'psychotechnic';
    this.showForm = true;
    this.editingTest = true;
    this.currentTestId = test.idPsychotechnicTest; // Make sure this is set
    
    const psychotechnicForm = this.testForm.get('psychotechnic') as FormGroup;
    psychotechnicForm.patchValue({
      title: test.title,
      intro: test.intro,
      randomOrder: test.randomOrder
    });
  
    while (this.psychotechnicQuestions.length > 0) {
      this.psychotechnicQuestions.removeAt(0);
    }
  
    test.questionspsycho.forEach(question => {
      const questionGroup = this.fb.group({
        questionpsychoLabel: [question.questionpsychoLabel, Validators.required],
        typeQ: [question.typeQ, Validators.required],
        questionpsychoId: [question.questionpsychoId], // Include question ID
        correctResponses: this.fb.array([]),
        falseResponses: this.fb.array([])
      });

      const correctResponsesArray = questionGroup.get('correctResponses') as FormArray;
      question.correctResponses.forEach(response => {
        correctResponsesArray.push(this.fb.group({
          label: [response, Validators.required]
        }));
      });

      const falseResponsesArray = questionGroup.get('falseResponses') as FormArray;
      question.falseResponses.forEach(response => {
        falseResponsesArray.push(this.fb.group({
          label: [response, Validators.required]
        }));
      });

      this.psychotechnicQuestions.push(questionGroup);
    });
  }

  cancelEdit(): void {
    this.showForm = false;
    this.editingTest = false;
    this.currentTestId = null;
  }

  submitTest(): void {
    if (!this.businessId) {
      console.error('No business ID found in user object');
      return;
    }

    if (this.activeTab === 'prehiring') {
      this.submitPrehiringTest();
    } else {
      this.submitPsychotechnicTest();
    }
  }

  submitPrehiringTest(): void {
    const formData = this.testForm.get('prehiring')?.value;
    const testData = this.mapToPrehiringTest(formData);

    if (this.editingTest && this.currentTestId) {
      this.prehiringTestsService.updateTest(this.currentTestId, testData).subscribe({
        next: (response) => {
          console.log('Prehiring test updated successfully:', response);
          this.loadTests();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating prehiring test:', err);
        }
      });
    } else {
      this.prehiringTestsService.addTest(testData, this.businessId).subscribe({
        next: (response) => {
          console.log('Prehiring test created successfully:', response);
          this.loadTests();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error creating prehiring test:', err);
        }
      });
    }
  }

  submitPsychotechnicTest(): void {
    if (!this.businessId) {
      console.error('No business ID found in user object');
      return;
    }
  
    const formData = this.testForm.get('psychotechnic')?.value;
    const testData = this.mapToPsychotechnicTest(formData);
  
    if (this.editingTest && this.currentTestId) {
      // Update existing test
      this.psychotechnicTestsService.updateTest(this.currentTestId, testData).subscribe({
        next: (response) => {
          console.log('Psychotechnic test updated successfully:', response);
          this.loadTests();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error updating psychotechnic test:', err);
        }
      });
    } else {
      // Create new test - make sure we don't send an ID
      testData.idPsychotechnicTest = undefined;
      this.psychotechnicTestsService.addTest(testData, this.businessId).subscribe({
        next: (response) => {
          console.log('Psychotechnic test created successfully:', response);
          this.loadTests();
          this.cancelEdit();
        },
        error: (err) => {
          console.error('Error creating psychotechnic test:', err);
        }
      });
    }
  }
  mapToPrehiringTest(formData: any): PrehiringTests {
    const questionsData = formData.questions.map((question: any) => {
      const falseResponses = question.responses.filter((r: any) => !r.state).map((r: any) => r.label);
      const correctResponses = question.responses.filter((r: any) => r.state).map((r: any) => r.label);

      return new QuestionsBusiness(
        0,
        question.questionLabel,
        falseResponses,
        correctResponses,
        question.score,
        question.time,
        question.typeQ
      );
    });

    return new PrehiringTests(
      this.currentTestId || '',
      formData.title,
      new Date(),
      formData.intro,
      questionsData,
      this.userId,
      { idBusiness: this.businessId },
      formData.randomOrder
    );
  }

  mapToPsychotechnicTest(formData: any): PsychotechnicTest {
    const questionsData: QuestionPsycho[] = formData.questions.map((question: any) => ({
      questionpsychoId: question.questionpsychoId || undefined, // Set to undefined for new questions
      questionpsychoLabel: question.questionpsychoLabel,
      correctResponses: question.correctResponses.map((r: any) => r.label),
      falseResponses: question.falseResponses.map((r: any) => r.label),
      typeQ: question.typeQ
    }));
  
    return {
      idPsychotechnicTest: this.editingTest ? this.currentTestId : undefined, // Only set ID for edits
      title: formData.title,
      creationDate: new Date(),
      intro: formData.intro,
      randomOrder: formData.randomOrder,
      iduser: this.businessId,
      business: { id: this.businessId },
      questionspsycho: questionsData
    };
  }
  isFormValid(): boolean {
    const currentForm = this.testForm.get(this.activeTab);
    return currentForm ? currentForm.valid : false;
  }

  deletePrehiringTest(testId: string): void {
    if (confirm('Are you sure you want to delete this test?')) {
      this.prehiringTestsService.deleteTest(testId).subscribe({
        next: () => {
          this.loadTests();
        },
        error: (err) => {
          console.error('Error deleting test:', err);
        }
      });
    }
  }

  deletePsychotechnicTest(testId: string): void {
    if (confirm('Are you sure you want to delete this test?')) {
      this.psychotechnicTestsService.deleteTest(testId).subscribe({
        next: () => {
          this.loadTests();
        },
        error: (err) => {
          console.error('Error deleting test:', err);
        }
      });
    }
  }
}