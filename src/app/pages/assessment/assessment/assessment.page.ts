import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ItemReorderEventDetail } from '@ionic/core';
import { ToastController } from '@ionic/angular';
import { IUser } from 'src/app/_models';
import { IAnswer, IAssessment, IQuestion, IStudentAssessment } from 'src/app/_models/assessment';
import { QuestionType } from 'src/app/_models/question-type';
import { AuthenticationService } from 'src/app/_services';
import { AssessmentService } from 'src/app/_services/assessment/assessment.service';
import { join } from 'path';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.page.html',
  styleUrls: ['./assessment.page.scss'],
})
export class AssessmentPage implements OnInit {
  title: string;
  assessment: IAssessment;
  assessmentAnswers: Array<IAnswer> = [];
  options = [1, 2, 3, 4];
  visibleQuestion = 0;
  questionCount = 0;
  isNext = false;
  currentUser: IUser;
  isSortAllow = true;
  ansAttempts = 1;
  allMatched: boolean;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private assessmentService: AssessmentService,
    private authenticationService: AuthenticationService,
    private toastController: ToastController,
  ) { }

  ngOnInit() {
    this.authenticationService.currentUser?.subscribe((user) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.title = this.activatedRoute.snapshot.paramMap.get('subject');
      const assessmentId = this.activatedRoute.snapshot.paramMap.get('id');
      this.assessmentService.GetOfflineAssessments().subscribe((subjectWise) => {
        subjectWise.subscribe((subjectAssessments) => {
          const subjectWiseAssessments = subjectAssessments.find((a) => a.subjectName.toLowerCase() === this.title.toLowerCase());
          if (subjectWiseAssessments) {
            this.assessment = subjectWiseAssessments.assessments?.find((a) => a.id === assessmentId) || {};
            if (!this.assessment) {
              this.router.navigateByUrl(`assessment/quizzes/${this.title}`);
            }
            this.questionCount = this.assessment.assessmentQuestions.length - 1;
          }
        })
      });
    });
  }

  visibleNext(question: IQuestion, index: number) {
    return true;
  }

  validateAnswerColor(selectedOption, option, question: IQuestion) {
    selectedOption = selectedOption?.value?.option;
    return selectedOption === option && selectedOption === question.optionAnswer ? 'success' : '';
  }

  shortAnswerText(shortAnswer: any, questionId: string) {
    shortAnswer = shortAnswer.value.trim();
    if (shortAnswer?.length) {
      this.isNext = true;
      this.UpdateAnswer(questionId, 0, shortAnswer);
    } else {
      this.isNext = false;
    }
  }

  selectedAnswerOption(selectedOption) {
    selectedOption = selectedOption.value;
    if (selectedOption.option) {
      const optionQuestion: { option: number, question: IQuestion } = selectedOption;
      if (optionQuestion.option === optionQuestion.question.optionAnswer) {
        this.isNext = true;
      } else {
        this.isNext = false;
        this.presentToast(`Select correct answer.`, 'danger');
      }
      this.UpdateAnswer(optionQuestion.question.id, optionQuestion.option);
    }
  }

  moveNextQuestion() {
    this.visibleQuestion = this.visibleQuestion + 1;
    this.isNext = !this.isNext;
  }

  SubmitAssessment() {
    const finalAssessment = {
      assessmentId: this.assessment.id,
      assessmentAnswers: this.assessmentAnswers,
      classId: this.currentUser.classId,
      schoolId: this.currentUser.defaultSchool.id,
      studentId: this.currentUser.id,
      studentName: this.currentUser.firstName + ' ' + this.currentUser.lastName,
      createdDate: new Date()
    } as IStudentAssessment;

    this.assessmentService.SubmitStudentAssessment(finalAssessment).subscribe((res) => {
      this.presentToast('Assessment quiz submit successfully.', 'success');
      this.router.navigateByUrl(`/assessments`);
    });
  }

  onRenderItems(event: CustomEvent<ItemReorderEventDetail>, question) {
    const matchColumns = question.matchColumns;
    let draggedItem = matchColumns["Right"].splice(event.detail.from, 1)[0];
    matchColumns["Right"].splice(event.detail.to, 0, draggedItem)
    event.detail.complete();
     this.allMatched = true;
    matchColumns["Right"].forEach((item, index) => {
      if (item.id === matchColumns["Left"][index].id) {
        item.validCSS = "validCSS";
      } else {
        item.validCSS = "inValidCSS";
        this.allMatched = false;
      }
    });
    this.isSortAllow = false;
    this.isNext = false;
  }

  matchColumn(question) {
    if (this.allMatched) {
      this.UpdateAnswer(question.id, 0, 'allMatched', this.ansAttempts);
      this.isNext = this.allMatched;
    } else {
      this.ansAttempts = this.ansAttempts + 1;
      this.presentToast("Columns were not match, Please try again", "warning")
    }
   
  }

  reorderItems(items, from, to) {
    let element = items[from];
    items.splice(from, 1);
    items.splice(to, 0, element);
    return items;
  }

  private async presentToast(msg, type) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: 1500,
      color: type,
      buttons: [{
        text: 'Close',
        role: 'cancel',
      }
      ]
    });
    toast.present();
  }

  private UpdateAnswer(questionId: string, optionAnswer?: number, shortAnswer?: string, ansAttempts = 1) {
    const answer = {
      optionAnswer,
      questionId,
      attempts: ansAttempts,
      shortAnswer,
    } as IAnswer;
    const index = this.assessmentAnswers.findIndex((f: IAnswer) => answer.questionId === f.questionId);
    if (-1 === index) {
      this.assessmentAnswers = [...this.assessmentAnswers, answer];
    } else {
      const ans = this.assessmentAnswers[index];
      ans.questionId = answer.questionId;
      ans.attempts = shortAnswer ? 1 : ans.attempts + 1;
      ans.optionAnswer = answer.optionAnswer;
      ans.shortAnswer = answer.shortAnswer;
      this.assessmentAnswers = [...this.assessmentAnswers.slice(0, index), ans, ...this.assessmentAnswers.slice(index + 1)];
    }
  }
}
