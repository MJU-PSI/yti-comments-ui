import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { Localizable } from '@goraresult/yti-common-ui';

@Component({
  selector: 'app-localizable-undefined-textarea',
  template: `
    <dl>
      <dt *ngIf="label">
        <label>{{ label }}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="showRequired && required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="editing" class="form-group">
          <textarea [id]="id"
                    autosize
                    class="form-control"
                    [ngClass]="{ 'is-invalid': !valid }"
                    [ngModel]="value[contentLanguage]"
                    (ngModelChange)="onChange($event)"></textarea>
          <app-error-messages [id]="id + '_error_messages'" [control]="parentControl"></app-error-messages>
        </div>
        <app-literal-multilanguage *ngIf="!editing && value[contentLanguage] && value[contentLanguage].length > 0"
                                   [value]="value"></app-literal-multilanguage>
        <span *ngIf="!editing && (!value[contentLanguage] || value[contentLanguage].length === 0)">-</span>
      </dd>
    </dl>
  `
})
export class LocalizableUndefinedTextareaComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() restrict = false;
  @Input() required = false;
  @Input() showRequired = true;
  @Input() id: string;
  @Input() infoText: string;

  value: Localizable = {};

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService) {

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get valid() {

    return !this.parentControl || this.parentControl.valid;
  }

  onChange(value: string) {

    this.value[this.contentLanguage] = value;
    this.propagateChange(this.value);
  }

  get editing() {

    return this.editableService.editing && !this.restrict;
  }

  get contentLanguage() {

    return 'und';
  }

  writeValue(obj: any): void {

    this.value = Object.assign({}, obj);
  }

  registerOnChange(fn: any): void {

    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {

    this.propagateTouched = fn;
  }
}
