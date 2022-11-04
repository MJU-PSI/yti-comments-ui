import { Component, Injectable, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { LanguageService } from '../../services/language.service';
import { ModalService, contains } from '@vrk-yti/yti-common-ui';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '../../entities/user';
import { UserType } from '../../services/api-schema';
import { EditableService } from '../../services/editable.service';
import { TempUser } from '../../entities/tempuser';

@Component({
  selector: 'app-add-temp-users-modal',
  providers: [EditableService],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body">
      <form [formGroup]="tempUsersForm" #form="ngForm">
        <div *ngIf="tempUserForms.controls.length > 0" formArrayName="tempUsers">
          <div class="row">
            <dt class="col-md-3">
              <label translate>First name</label>
              <app-information-symbol [infoText]="'INFO_TEXT_USER_FIRSTNAME'"></app-information-symbol>
              <app-required-symbol></app-required-symbol>
            </dt>
            <dt class="col-md-4">
              <label translate>Last name</label>
              <app-information-symbol [infoText]="'INFO_TEXT_USER_LASTNAME'"></app-information-symbol>
              <app-required-symbol></app-required-symbol>
            </dt>
            <dt class="col-md-4">
              <label translate>Email</label>
              <app-information-symbol [infoText]="'INFO_TEXT_USER_EMAIL'"></app-information-symbol>
              <app-required-symbol></app-required-symbol>
            </dt>
            <div class="col-md-1"></div>
          </div>
          <ng-container *ngFor="let userForm of tempUserForms.controls; let i = index" [formGroupName]="i">
            <div class="row">
              <app-literal-input class="col-md-3"
                                 [id]="'user_' + i + '_firstname_input'"
                                 [required]="true"
                                 [formControlName]="'firstName'"></app-literal-input>

              <app-literal-input class="col-md-4"
                                 [id]="'user_' + i + '_lastname_input'"
                                 [required]="true"
                                 [formControlName]="'lastName'"></app-literal-input>

              <app-literal-input class="col-md-4"
                                 [id]="'user_' + i + '_email_input'"
                                 [required]="true"
                                 [formControlName]="'email'"></app-literal-input>
              <div class="col-md-1">
                <button *ngIf="tempUserForms.controls.length > 1"
                        [id]="'remove_row_' + i + '_button'"
                        type="button"
                        class="icon icon-trash"
                        (click)="removeRow(i)">
                </button>
              </div>
            </div>
          </ng-container>
        </div>
      </form>
      <button id="add_user_button"
              type="button"
              class="btn btn-secondary-action"
              (click)="addNewRowToUserForm()">
        <span translate>+ Add row</span>
      </button>
    </div>
    <div class="modal-footer">
      <button id="add_users_button"
              type="button"
              class="btn btn-action"
              [disabled]="!tempUsersForm.valid"
              (click)="addUsers()">
        <span translate>Add</span>
      </button>
      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()">
        <span translate>Cancel</span>
      </button>
    </div>
  `
})
export class AddTempUsersModalComponent {

  @Input() restrictedEmails: string[];
  @Input() titleLabel: string;
  @Input() addLabel: string;
  @Input() useUILanguage: boolean;

  emailValidator = '(?:[a-z0-9!#$%&\'*+/=?^_`{|}~-]+(?:\\.[a-z0-9!#$%&\'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\\])';

  tempUsersForm = new FormGroup({
    tempUsers: new FormArray([])
  });

  constructor(public modal: NgbActiveModal,
              private editableService: EditableService,
              public languageService: LanguageService) {

    this.editableService.edit();
    this.addNewRowToUserForm();
  }

  removeRow(i: number) {
    this.tempUserForms.removeAt(i);
  }

  get tempUserForms(): FormArray {

    return this.tempUsersForm.get('tempUsers') as FormArray;
  }

  addNewRowToUserForm() {
    // email: new FormControl('', [Validators.required, this.validateEmail.bind(this)], this.asyncFilterEmails().bind(this))

    const userFormGroup: FormGroup = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, this.validateEmail.bind(this), this.filterEmails.bind(this)])
    });
    this.tempUserForms.push(userFormGroup);
  }

  addUsers() {

    const users: User[] = [];
    const tempUsers: FormArray = this.tempUserForms;
    tempUsers.controls.forEach(tempUserFormGroup => {
      const userType: UserType = <UserType>{
        firstName: tempUserFormGroup.value.firstName,
        lastName: tempUserFormGroup.value.lastName,
        email: tempUserFormGroup.value.email
      };
      users.push(new User(userType));
    });
    this.modal.close(users);
  }

  cancel() {

    this.modal.dismiss('cancel');
  }

  filterEmails(control: AbstractControl) {

    const allRestrictedEmails: string[] = [];
    if (this.restrictedEmails != null) {
      this.restrictedEmails.forEach(restrictedEmail => {
        allRestrictedEmails.push(restrictedEmail);
      });
    }
    if (this.tempUserForms) {
      this.tempUserForms.controls.forEach(tempUserControl => {
        if (tempUserControl !== control) {
          const controlEmail: string = tempUserControl.value.email;
          if (controlEmail !== '') {
            allRestrictedEmails.push(controlEmail);
          }
        }
      });
    }
    if (allRestrictedEmails.length > 0 && control.value != null && control.value.length > 0) {
      const isNotRestricted = !contains(allRestrictedEmails, control.value.toLowerCase());
      return !isNotRestricted ? { 'emailExistsError': { value: control.value } } : null;
    }
    return null;
  }

  validateEmail(control: AbstractControl) {
    if (control.value != null && control.value.length > 0) {
      const isEmailValid = control.value.match(this.emailValidator);
      return !isEmailValid ? { 'emailValidationError': { value: control.value } } : null;
    }
    return null;
  }
}

@Injectable()
export class AddTempUsersModalService {

  constructor(private modalService: ModalService) {
  }

  open(titleLabel: string,
       addLabel: string,
       restrictedEmails: string[],
       useUILanguage: boolean = false): Promise<TempUser[]> {

    const modalRef = this.modalService.open(AddTempUsersModalComponent, { size: 'lg', backdrop: 'static', keyboard: false });
    const instance = modalRef.componentInstance as AddTempUsersModalComponent;
    instance.titleLabel = titleLabel;
    instance.addLabel = addLabel;
    instance.restrictedEmails = restrictedEmails;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
