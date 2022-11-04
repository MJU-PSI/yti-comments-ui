import { Component, Input, Optional, Self } from '@angular/core';
import { EditableService } from '../../services/editable.service';
import { ControlValueAccessor, FormControl, NgControl } from '@angular/forms';
import { ignoreModalClose } from '@vrk-yti/yti-common-ui';
import { DataService } from '../../services/data.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { IntegrationResource } from '../../entities/integration-resource';
import { SearchLinkedContainerModalService } from './search-linked-integration-container-modal.component';

function addToControl<T>(control: FormControl, item: T) {

  control.setValue(item);
}

function removeFromControl<T>(control: FormControl) {

  control.setValue(null);
}

@Component({
  selector: 'app-source-input',
  template: `
    <dl *ngIf="editing || resource">
      <dt>
        <label>{{label}}</label>
        <app-information-symbol [infoText]="infoText"></app-information-symbol>
        <app-required-symbol *ngIf="required && editing"></app-required-symbol>
      </dt>
      <dd>
        <div *ngIf="!editing && resource">
          <app-literal-multilanguage [value]="resource.prefLabel"></app-literal-multilanguage>
        </div>
        <div *ngIf="editing && resource">
          <a class="removal-X">
            <i id="remove_resource_link"
               class="fa fa-times"
               (click)="removeSource()"></i>
          </a>
          <span>{{resource.getDisplayName(languageService, false)}}</span>
        </div>

        <app-error-messages id="source_error_messages" [control]="parentControl"></app-error-messages>

        <button *ngIf="editing"
                id="add_resource_button"
                type="button"
                class="btn btn-sm btn-action mt-2"
                (click)="selectSource()">
          <span translate>Select resource</span>
        </button>
      </dd>
    </dl>
  `
})
export class SourceInputComponent implements ControlValueAccessor {

  @Input() label: string;
  @Input() required = false;
  @Input() infoText: string;
  @Input() restricts: string[] = [];
  @Input() containerType: string;
  @Input() containerUri: string;

  control = new FormControl(null);

  private propagateChange: (fn: any) => void = () => {};
  private propagateTouched: (fn: any) => void = () => {};

  constructor(@Self() @Optional() public parentControl: NgControl,
              private editableService: EditableService,
              private translateService: TranslateService,
              private dataService: DataService,
              private searchLinkedContainerModalService: SearchLinkedContainerModalService,
              public languageService: LanguageService) {

    this.control.valueChanges.subscribe(x => this.propagateChange(x));

    if (parentControl) {
      parentControl.valueAccessor = this;
    }
  }

  get resource() {

    return this.control.value as IntegrationResource;
  }

  selectSource() {

    this.searchLinkedContainerModalService
      .open(this.containerType, this.restricts, true)
      .then(source => addToControl(this.control, source), ignoreModalClose);
  }

  removeSource() {

    removeFromControl(this.control);
  }

  get editing() {

    return this.editableService.editing;
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
