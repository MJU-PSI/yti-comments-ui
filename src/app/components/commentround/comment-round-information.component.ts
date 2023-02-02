import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChange } from '@angular/core';
import { CommentRound } from '../../entities/commentround';
import { AuthorizationManager } from '../../services/authorization-manager';
import { LanguageService } from '../../services/language.service';
import { Localizable, hasLocalization, requiredList } from '@mju-psi/yti-common-ui';
import { ConfigurationService } from '../../services/configuration.service';
import { FormControl, FormGroup } from '@angular/forms';
import { validDateRange } from '../../utils/date';
import { CommentRoundStatus } from '../../entities/comment-round-status';
import { Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { EditableService } from '../../services/editable.service';
import { CommentThreadSimple } from '../../entities/commentthread-simple';

@Component({
  selector: 'app-comment-round-information',
  templateUrl: './comment-round-information.component.html',
  providers: [EditableService]
})
export class CommentRoundInformationComponent implements OnInit, OnDestroy, OnChanges {

  @Input() commentRound: CommentRound;
  @Input() commentThreads: CommentThreadSimple[];

  @Output() changeTabControl = new EventEmitter<boolean>();
  @Output() refreshCommentRound = new EventEmitter();

  cancelSubscription: Subscription;
  editSubscription: Subscription;

  commentRoundForm = new FormGroup({
    label: new FormControl(''),
    description: new FormControl(''),
    localName: new FormControl(),
    fixedThreads: new FormControl(),
    openThreads: new FormControl(),
    validity: new FormControl({ start: null, end: null }, validDateRange),
    status: new FormControl('INCOMPLETE' as CommentRoundStatus),
    organizations: new FormControl([], [requiredList]),
    tempUsers: new FormControl([])
  }, null);

  constructor(public languageService: LanguageService,
              public configurationService: ConfigurationService,
              private authorizationManager: AuthorizationManager,
              private dataService: DataService,
              private editableService: EditableService) {

    this.editSubscription = editableService.edit$.subscribe(() => this.changeTabControl.emit(true));
    this.cancelSubscription = editableService.cancel$.subscribe(() => {
      this.changeTabControl.emit(false);
      this.reset();
    });
    editableService.onSave = (formValue: any) => this.save(formValue);
  }

  ngOnInit() {

    this.reset();
  }

  ngOnDestroy() {

    this.cancelSubscription.unsubscribe();
  }

  ngOnChanges(changes: { [property: string]: SimpleChange }) {

    const commentRoundChange: SimpleChange = changes['commentRound'];
    if (commentRoundChange && !commentRoundChange.isFirstChange()) {
      this.commentRound = commentRoundChange.currentValue;
      this.reset();
    }

    const commentThreadsChange: SimpleChange = changes['commentThreads'];
    if (commentThreadsChange && !commentThreadsChange.isFirstChange()) {
      this.commentThreads = commentThreadsChange.currentValue;
    }
  }

  private reset() {

    if (this.loading) {
      return;
    }

    const { label, description, fixedThreads, openThreads, startDate, endDate, organizations, status, tempUsers } = this.commentRound;

    this.commentRoundForm.reset({
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      validity: { start: startDate, end: endDate },
      organizations: organizations.map(organization => organization.clone()),
      tempUsers: tempUsers.map(tempUser => tempUser.clone()),
      status: status
    });
  }

  get loading() {
    return this.commentRound == null;
  }

  get isEditorOrSuperUser(): boolean {

    return this.authorizationManager.user.superuser || this.commentRound.user.id === this.authorizationManager.user.id;
  }

  hasLocalization(localizable: Localizable) {

    return hasLocalization(localizable);
  }

  get toolType(): string {

    return this.commentRound.source.containerType;
  }

  get getResourceUri(): string | null {

    return this.configurationService.getUriWithEnv(this.commentRound.source.containerUri);
  }

  get hasCommentThreads(): boolean {

    return this.commentThreads.length > 0;
  }

  get commentRoundCountTranslateParams() {

    return {
      value: this.commentThreads.length
    };
  }

  get showModifyButton() {

    return this.isEditorOrSuperUser;
  }

  save(formData: any): Observable<any> {

    const { label, description, fixedThreads, openThreads, validity, organizations, tempUsers, status } = formData;
    const updatedCommentRound = this.commentRound.clone();

    Object.assign(updatedCommentRound, {
      label: label,
      description: description,
      fixedThreads: fixedThreads,
      openThreads: openThreads,
      startDate: validity.start,
      endDate: validity.end,
      organizations: organizations,
      tempUsers: tempUsers,
      source: this.commentRound.source,
      sourceLocalName: this.commentRound.sourceLocalName,
      sourceLabel: this.commentRound.sourceLabel,
      status: status,
      commentThreads: null
    });

    const save = () => {
      return this.dataService.updateCommentRound(updatedCommentRound.serialize()).pipe(tap(() => {
        this.changeTabControl.emit(false);
        this.refreshCommentRound.emit();
      }));
    };

    return save();
  }

  get editing() {

    return this.editableService.editing;
  }

  getCommentRoundUri() {

    return this.configurationService.getUriWithEnv(this.commentRound.uri);
  }
}
