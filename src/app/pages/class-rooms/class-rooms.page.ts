import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { AlertController, IonSelect, PopoverController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/_services';
import { Router, ActivatedRoute } from '@angular/router';
import { IClassRoom, ISchool, IUser } from 'src/app/_models';
import { ActionPopoverPage } from '../../components/action-popover/action-popover.page';
import { ClassRoomService } from 'src/app/_services/class-room/class-room.service';

@Component({
  selector: 'app-class-rooms',
  templateUrl: './class-rooms.page.html',
  styleUrls: ['./class-rooms.page.scss'],
})
export class ClassRoomsPage implements OnInit {
  @ViewChild('schoolList') schoolSelectRef: IonSelect;
  classRooms: IClassRoom[] = [];
  schools: ISchool[] = [];
  schoolId: string;
  schoolName: string;
  currentUser: IUser;

  constructor(
    private authenticationService: AuthenticationService,
    private popoverController: PopoverController,
    public router: Router,
    private activatedRoute: ActivatedRoute,
    public alertController: AlertController,
    public classRoomService: ClassRoomService,

  ) { }

  ngOnInit() {
  }

  ionViewDidEnter() {
    this.refreshClassRoom();
  }

  refresh(schoolId: string) {
    setTimeout(() => {
      const school = this.currentUser.schools.find((s) => s.id === schoolId);
      this.classRooms = [...school.classRooms];
      this.schoolName = school.name;
    }, 10);
  }

  public selectSchool() {
    this.schoolSelectRef.open();
  }

  setSchool(selectedValue) {
    this.authenticationService.ResetDefaultSchool(selectedValue.detail.value);
    this.router.navigateByUrl(`/class-rooms/${selectedValue.detail.value}`);
    //this.refresh(this.currentUser.defaultSchool.id);
  }

  public async actionPopover(ev: any, classId: string) {

    const popover = await this.popoverController.create({
      component: ActionPopoverPage,
      mode: 'ios',
      event: ev,
      componentProps: { id: classId, schoolId: this.currentUser.defaultSchool.id, type: 'class-room' },
      cssClass: 'pop-over-style',
    });

    popover.onDidDismiss().then((data) => {
      if (!data.data) {
        return;
      }
      const actionData = data?.data;
      switch (actionData?.selectedOption) {
        case 'edit':
          this.ClassRoomEdit(actionData.currentId);
          break;
        case 'delete':
          this.ClassRoomDelete(actionData.currentId);
          break;
        default:
          break;
      }
    });

    return await popover.present();
  }

  public ClassRoomEdit(classId: string) {
    this.router.navigateByUrl(`/class-room/edit/${this.currentUser.defaultSchool.id}/${classId}`);
  }

  public StudentList(ev: any, classId: string) {
    this.router.navigateByUrl(`/students/${this.currentUser.defaultSchool.id}/${classId}`);
  }

  public NewStudent(ev: any, classId: string) {
    this.router.navigateByUrl(`/student/add/${this.currentUser.defaultSchool.id}/${classId}`);
  }

  public TakeAttendance(ev: any, classId: string) {
    this.router.navigateByUrl(`/attendance/${this.currentUser.defaultSchool.id}/${classId}`);
  }

  private async ClassRoomDelete(classRoomId: string) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Confirm Delete',
      message: 'Are you sure you want delete this class?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        }, {
          text: 'Okay',
          handler: () => {
            this.classRoomService.DeleteClassRoom(this.schoolId, classRoomId).toPromise().finally(() => {
              setTimeout(() => {
                this.refreshClassRoom();
              }, 500);
            });
          }
        }
      ]
    });
    await alert.present();
  }

  private refreshClassRoom() {

    this.authenticationService.currentUser.subscribe((user) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.schools = user.schools;

      this.schoolId = this.activatedRoute.snapshot.paramMap.get('schoolId');
      if (this.schoolId) {
        this.refresh(this.schoolId);
      } else {
        this.schoolId = this.currentUser.defaultSchool.id;
        this.refresh(this.schoolId);
      }
    });
  }

}
