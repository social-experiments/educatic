import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Role } from 'src/app/_models';
import { ViewerModalComponent } from 'ngx-ionic-image-viewer';
import { ICourseContentCategory } from 'src/app/_models/course-content-category';
import { CourseContentService } from 'src/app/_services/course-content/course-content.service';
import { ICategoryContentList, ICourseContent } from '../../../_models/course-content';
import { AuthenticationService } from '../../../_services/authentication/authentication.service';
import { CourseSharePage } from '../course-share/course-share.page';
import { ContentHelper } from 'src/app/_helpers/content-helper';
import { ActionPopoverPage } from 'src/app/components/action-popover/action-popover.page';
import { ContentOfflineService } from 'src/app/_services/content-offline/content-offline.service';
import * as blobUtil from 'blob-util';
import { HttpEventType } from '@angular/common/http';
import { SpinnerVisibilityService } from 'ng-http-loader';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.page.html',
  styleUrls: ['./courses.page.scss']
})
export class CoursesPage implements OnInit {

  courseContent: ICourseContent[] = [];
  categoryWiseContent: ICategoryContentList[];
  levelWiseContent: ICategoryContentList[];
  categoryList: ICourseContentCategory[] = [];
  courseContentDisplay = false;
  isStudent = false;
  title = '';

  constructor(
    private modalController: ModalController,
    private authService: AuthenticationService,
    private contentService: CourseContentService,
    private toastController: ToastController,
    private alertController: AlertController,
    private router: Router,
    private popoverController: PopoverController,
    private contentOfflineService: ContentOfflineService,
    private spinner: SpinnerVisibilityService,
  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.refreshContent();
  }


  public ViewContent(content: ICourseContent[]) {
    this.courseContent = [...content];
    this.courseContentDisplay = true;
    this.title = 'Course content - ' + content[0].courseCategory;
  }

  public dismissModal() {
    this.courseContent = [];
    this.courseContentDisplay = false;
  }

  public async ShareCourse(contentId) {
    const modal: HTMLIonModalElement =
      await this.modalController.create({
        component: CourseSharePage,
        mode: 'ios',
        componentProps: { contentId }
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
    const contentType = content.courseURL.replace(/^.*\./, '').toLowerCase();
    if (ContentHelper.PdfSupported.indexOf(contentType) > -1) {
      this.router.navigateByUrl(`content/${content.id}/pdf-viewer`, { state: content });
    } else if (ContentHelper.AudioVideoSupported.indexOf(contentType) > -1) {
      this.router.navigateByUrl(`content/${content.id}/video-viewer`, { state: content });
    } else if (ContentHelper.ImgSupported.indexOf(contentType.toLowerCase()) > -1) {
      if (content.isOffline) {
        const blob = blobUtil.base64StringToBlob(content.offlineData, content.type);
        this.openViewer(window.URL.createObjectURL(blob), content);
      } else {
        this.contentService.GetAzureContentURL(content.courseURL).subscribe((url) => {
          this.openViewer(url, content);
        })
      }
    }
  }

  TakeAssessment(content: ICourseContent) {
    this.router.navigateByUrl(`assessment/${content.id}`, { state: content });
  }

  refreshContent() {
    this.authService.currentUser.subscribe((user) => {
      if (!user) {
        return;
      }
      if (user.role === Role.Student) {
        this.isStudent = true;
      }
      this.contentService.getOfflineCourseContents().subscribe((courseContent) => {
        if (courseContent) {
          setTimeout(() => {
            this.contentService.GetCategoryWiseContent(courseContent).subscribe((groupResponse) => {
              const contents = Object.values(groupResponse.reverse());
              this.categoryWiseContent = [...contents];
            });
          }, 10);
        }
      })
    });


  }

  public async actionPopover(ev: any, content) {
    console.log("content: ", content);
    const popover = await this.popoverController.create({
      component: ActionPopoverPage,
      mode: 'ios',
      event: ev,
      componentProps: { type: 'course', isOffline: content.isOffline },
      cssClass: 'pop-over-style',
    });

    popover.onDidDismiss().then((data) => {
      if (!data.data) {
        return;
      }
      const actionData = data?.data;
      switch (actionData?.selectedOption) {
        case 'enableOffline':
          this.downloadContentToOffline(content);
          break;
        case 'share':
          this.ShareCourse(content.id);
          break;
        case 'remove':
          this.confirmCourseDelete(content);
          break;
        default:
          break;
      }
    });
    return await popover.present();
  }

  async openViewer(imgContentURL: string, content: ICourseContent) {
    const modal = await this.modalController.create({
      component: ViewerModalComponent,
      mode: 'ios',
      componentProps: {
        src: imgContentURL,
        title: `${content.courseCategory} - ${content.courseName}`
      },
      cssClass: 'ion-img-viewer',
      keyboardClose: true,
      showBackdrop: true,
    });

    return await modal.present();
  }

  async confirmCourseDelete(course: ICourseContent) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm course delete!',
      message: `<strong>Are you sure you want to delete course?</strong>`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
        }, {
          text: 'Okay',
          handler: () => {
            course.active = false;
            this.contentService.UpdateCourse(course, course.id).subscribe(() => {
              this.presentToast('Course content delete successfully.', 'success');
              setTimeout(() => {
                this.refreshContent();
                this.courseContentDisplay = false;
              }, 10);
            });
          }
        }
      ]
    });

    await alert.present();
  }

  public downloadContentToOffline(content) {
    this.contentOfflineService.offlineContent(content, 'coursecontent').subscribe(
      (event) => {
        console.log("Event: ", event);
        if (event.type === HttpEventType.DownloadProgress) {
          this.spinner.show();
        }
        if (event.type === HttpEventType.Response) {
          this.spinner.hide();
          const blob = event.body;
          blobUtil.blobToBase64String(blob).then(streamData => {

            content.isOffline = true;
            content.offlineData = streamData;
            content.type = blob.type;
          })
            .then(() => {
              this.contentService.UpdateCourseContentOfflineList(content, content.id).then(() => {
                console.log("refreshContent");
                this.refreshContent();
              });
            })
        }
      });
  }

  private async presentToast(msg, type) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      duration: 3000,
      color: type,
      buttons: [{
        text: 'Close',
        role: 'cancel',
      }
      ]
    });
    toast.present();
  }

}
