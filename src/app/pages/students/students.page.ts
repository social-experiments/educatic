import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { IonSelect, PopoverController } from '@ionic/angular';

import { IStudent, IUser, ISchool, IClassRoom } from '../../_models';
import { AuthenticationService } from '../../_services';
import { ActionPopoverPage } from '../../components/action-popover/action-popover.page';
import { DataShareService } from '../../_services/data-share.service';
import { StudentService } from '../../_services/student/student.service';

@Component({
  selector: 'app-students',
  templateUrl: './students.page.html',
  styleUrls: ['./students.page.scss'],
})
export class StudentsPage implements OnInit, AfterViewInit {
  @ViewChild('classList') classSelectRef: IonSelect;
  students: IStudent[] = [];
  schools: ISchool[] = [];
  classRooms: any;
  schoolId: string;
  classRoomId: string;
  currentUser: IUser;

  constructor(
    private studentService: StudentService,
    private authenticationService: AuthenticationService,
    private popoverController: PopoverController,
    private dataShare: DataShareService,
    public router: Router,
    private activatedRoute: ActivatedRoute,

  ) { }

  ngOnInit() {
    this.classRoomId = this.activatedRoute.snapshot.paramMap.get('id');
    this.authenticationService.currentUser.subscribe(async (user) => {
      if (!user) {
        return;
      }
      this.currentUser = user;
      this.schoolId = user.defaultSchool.id;
      this.schools = user.schools;
      this.classRooms = user.defaultSchool.classRooms;
    });
  }

  ngAfterViewInit(): void {
    this.refresh();
  }

  async refresh() {
    if (this.classRoomId) {
      this.studentService.GetStudents(this.currentUser.defaultSchool.id, this.classRoomId).subscribe((data) => {
        this.students = [...data]
      });
    } else {
      this.classSelectRef.open();
    }
  }

  async selectClass() {
    await this.classSelectRef.open();
  }

  setClassRoom(selectedValue) {
    this.classRoomId = selectedValue.detail.value;
    this.refresh();
  }

  public async actionPopover(ev: any, studentId: string) {
    const popover = await this.popoverController.create({
      component: ActionPopoverPage,
      event: ev,
      componentProps: { id: studentId, type: 'student' },
      cssClass: 'pop-over-style',
    });

    popover.onDidDismiss().then((data) => {
      if (!data.data) {
        return;
      }
      const actionData = data?.data;
      switch (actionData?.selectedOption) {
        case 'edit':
          this.StudentEdit(actionData.currentId);
          break;
        case 'delete':
          this.StudentEdit(actionData.currentId);
          break;
        case 'upload-photo':
          this.router.navigateByUrl(`${this.currentUser.defaultSchool.id}/${this.classRoomId}/student/${actionData.currentId}/photos`);
          break;
        default:
          break;
      }
    });

    return await popover.present();
  }

  StudentEdit(studentId: string) {
    const currentStudent = this.students.find(student => student.id === studentId);
    this.dataShare.setData(currentStudent);
    this.router.navigateByUrl(`/student/${this.currentUser.defaultSchool.id}/${this.classRoomId}/edit/${studentId}`);
  }

  UploadPhoto(studentId: string) {
    this.router.navigateByUrl(`${this.currentUser.defaultSchool.id}/${this.classRoomId}/student/${studentId}/photos`);
  }
}
