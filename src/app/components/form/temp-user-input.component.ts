import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { LanguageService } from '../../services/language.service';
import { TempUser } from '../../entities/tempuser';
import { CommentRound } from '../../entities/commentround';
import { ignoreModalClose, ConfirmationModalService, comparingPrimitive } from '@mju-psi/yti-common-ui';
import { TranslateService } from '@ngx-translate/core';
import { AddTempUsersModalService } from './add-temp-users-modal.component';

function addToControl<T>(control: FormControl, itemToAdd: T) {

  const previous = control.value as T[];
  control.setValue([...previous, itemToAdd]);
}

function removeFromControl<T>(control: FormControl, itemToRemove: T) {

  const previous = control.value as T[];
  control.setValue(previous.filter(item => item !== itemToRemove));
}

@Component({
  selector: 'app-temp-user-input',
  template: `
    <dl>
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing">
          <div *ngFor="let tempUser of tempUsers">
            <span *ngIf="tempUser.email != null">{{tempUser.getDisplayName()}}</span>
          </div>
        </div>
        <div *ngIf="editing">
          <div *ngFor="let tempUser of tempUsers">
            <div *ngIf="tempUser.email != null">
              <a class="removal-X">
                <i [id]="'remove_' + tempUser.email + '_tempuser_link'"
                   class="fa fa-times"
                   (click)="removeTempUser(tempUser)"></i>
              </a>
              <span>{{tempUser.getDisplayName()}}</span>
            </div>
          </div>
          <app-error-messages id="tempuser_error_messages" [control]="parentControl"></app-error-messages>
        </div>
        <button id="add_tempuser_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                *ngIf="editing"
                (click)="addTempUser()">
          <span translate>Add user</span>
        </button>
      </dd>
    </dl>
  `
})
export class TempUserInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() infoText: string;
  @Input() commentRound: CommentRound;

  control = new FormControl([]);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private addTempUsersModalService: AddTempUsersModalService,
              private confirmationModalService: ConfirmationModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get tempUsers(): TempUser[] {

    return (this.control.value as TempUser[])
      .sort(comparingPrimitive<TempUser>(tempUser => tempUser.lastName));
  }

  addTempUser() {

    const titleLabel = this.translateService.instant('Add users to comment round');
    const addLabel = this.translateService.instant('Add user');
    const restrictedEmails = this.tempUsers ? this.tempUsers.map(tempUser => tempUser.email) : [];

    this.addTempUsersModalService.open(titleLabel, addLabel, restrictedEmails, true)
      .then(tempUsers => tempUsers.forEach(tempUser => addToControl(this.control, tempUser)), ignoreModalClose);
  }

  removeTempUser(tempUser: TempUser) {

    this.confirmationModalService.open('REMOVE USER FROM COMMENT ROUND?')
      .then(() => {
        removeFromControl(this.control, tempUser);
      }, ignoreModalClose);
  }

  get editing() {

    return this.editableService.editing && !this.restrict;
  }

  writeValue(obj: any): void {

    this.control.setValue(obj);
  }

  registerOnChange(fn: any): void {

    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {

    this.propagateTouched = fn;
  }
}
