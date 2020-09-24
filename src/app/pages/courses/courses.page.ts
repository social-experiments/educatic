import { Component, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Role } from 'src/app/_models';
import { ICourseContentCategory } from 'src/app/_models/course-content-category';
import { CourseContentService } from 'src/app/_services/course-content/course-content.service';
import { ICategoryContentList, ICourseContent } from '../../_models/course-content';
import { AuthenticationService } from '../../_services/authentication/authentication.service';
import { CourseSharePage } from '../course-share/course-share.page';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss'],
})
export class CoursesPage implements OnInit {

  courseContent: ICourseContent[] = [];
  categoryWiseContent: ICategoryContentList[];
  categoryList: ICourseContentCategory[] = [];
  courseContentDisplay = false;
  isStudent = false;
  title = '';
  constructor(
    private modalController: ModalController,
    private authService: AuthenticationService,
    private contentService: CourseContentService,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.authService.currentUser.subscribe((user) => {
      if (!user) {
        return;
      }
      if (user.role === Role.Student) {
        this.isStudent = true;
      }
      if (user.courseContent) {
        this.contentService.GetCategoryWiseContent(user.courseContent).subscribe((groupResponse) => {
          this.categoryWiseContent = Object.values(groupResponse);
        });
      }
    });
  }


  public ViewContent(content: ICourseContent[]) {
    this.courseContent = [...content];
    this.courseContentDisplay = true;
    this.title = 'Course content - ' + content[0].categoryName;
  }

  public dismissModal() {
    this.courseContent = [];
    this.courseContentDisplay = false;
  }

  public async ShareCourse(event) {
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: CourseSharePage,
        componentProps: {
        }
      });
    await modal.present();
  }

  courseAdd() {
    this.categoryList = this.categoryWiseContent.map((cat, index) => {
      return { id: index.toString(), name: cat.key } as ICourseContentCategory;
    })

    this.router.navigateByUrl('/course/add', { state: this.categoryList });
  }

  ContentViewer(content: ICourseContent) {
    this.router.navigateByUrl(`content/${content.id}/viewer`, { state: content });
  }

}
