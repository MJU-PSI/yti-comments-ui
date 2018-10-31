import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';

@Component({
  selector: 'app-literal-input',
  template: `
    <dl *ngIf="show">
      <dt>
        <label *ngIf="label">{{ label }}</label>
        <app-information-symbol *ngIf="label" [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="label && required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <input [id]="id"
                 type="text"
                 class="form-control"
                 [ngClass]="{ 'is-invalid': !valid && !pending }"
                 [formControl]="control"/>
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <div class="text-content-wrap" *ngIf="!editing && translate" translate>{{ control.value }}</div>
        <div class="text-content-wrap" *ngIf="!editing && !translate">{{ control.value }}</div>
      </dd>
    </dl>
  `
})
export class LiteralInputComponent implements ControlValueAccessor {

  @Input() label: string | undefined;
  @Input() restrict = false;
  @Input() id: string;
  @Input() required = false;
  @Input() infoText: string;
  @Input() isEditing = false;
  @Input() translate = false;

  control = new FormControl();

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get valid() {

    return !this.parentControl || this.parentControl.valid;
  }

  get pending() {

    return !this.parentControl || this.parentControl.pending;
  }

  get show() {

    return this.editing || this.control.value;
  }

  get editing() {

    return (this.editableService.editing || this.isEditing) && !this.restrict;
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
