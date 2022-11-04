import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommentRound } from '../../entities/commentround';
import { Comment } from '../../entities/comment';
import { DataService } from '../../services/data.service';
import { Location } from '@angular/common';
import { LocationService } from '../../services/location.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentsConfirmationModalService } from '../common/confirmation-modal.service';
import { ignoreModalClose, UserService } from '@vrk-yti/yti-common-ui';
import { LanguageService } from '../../services/language.service';
import { ConfigurationService } from '../../services/configuration.service';
import { NgbNavChangeEvent, NgbNav } from '@ng-bootstrap/ng-bootstrap';
import { CommentsErrorModalService } from '../common/error-modal.service';
import { EditableService } from '../../services/editable.service';
import { CommentThreadSimple } from '../../entities/commentthread-simple';
import { MessagingService } from '../../services/messaging-service';

@Component({
  selector: 'app-commentround',
  templateUrl: './comment-round.component.html',
  styleUrls: ['./comment-round.component.scss'],
  providers: [EditableService]
})
export class CommentRoundComponent implements OnInit {

  @ViewChild('nav') nav: NgbNav;

  commentRound: CommentRound;
  commentThreads: CommentThreadSimple[];
  myComments: Comment[];
  blockTabChange: boolean;
  activeThreadId: number | undefined = undefined;
  hasSubscription: boolean | undefined = undefined;

  constructor(public languageService: LanguageService,
              public configurationService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute,
              private dataService: DataService,
              private messagingService: MessagingService,
              private locationService: LocationService,
              private location: Location,
              private authorizationManager: AuthorizationManager,
              private confirmationModalService: CommentsConfirmationModalService,
              private errorModalService: CommentsErrorModalService,
              private editableService: EditableService,
              private userService: UserService) {
  }

  ngOnInit() {

    const commentRoundIdentifier = this.route.snapshot.params.round;
    this.activeThreadId = this.route.snapshot.params.thread;

    if (!commentRoundIdentifier) {
      throw new Error(`Illegal route, commentRound: '${commentRoundIdentifier}'`);
    }

    this.dataService.getCommentRound(commentRoundIdentifier).subscribe(commentRound => {
      this.commentRound = commentRound;
      this.checkSubscription();
      this.locationService.atCommentRoundPage(commentRound);
    });

    this.dataService.getCommentRoundCommenterComments(commentRoundIdentifier).subscribe(comments => {
      this.myComments = comments;
    });

    this.dataService.getCommentRoundCommentThreads(commentRoundIdentifier).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  getInitialTabId(): string {

    if (this.activeThreadId) {
      return 'commentround_resources_tab';
    }
    return 'commentround_information_tab';
  }

  get showStartCommenting() {

    return (this.authorizationManager.canCreateComment(this.commentRound) &&
      this.commentRound.status === 'INPROGRESS' &&
      this.nav && this.nav.activeId !== 'commentround_comments_tab');
  }

  goToOwnComments() {

    this.nav.activeId = 'commentround_comments_tab';
  }

  goToResources() {

    this.nav.activeId = 'commentround_resources_tab';
  }

  startCommentRound() {

    this.confirmationModalService.startCommentRound()
      .then(() => {
        this.commentRound.status = 'INPROGRESS';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.commentRound = new CommentRound(commentRound);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  closeCommentRound() {

    this.confirmationModalService.closeCommentRound()
      .then(() => {
        this.commentRound.status = 'CLOSED';
        this.dataService.updateCommentRound(this.commentRound.serialize()).subscribe(commentRound => {
          this.commentRound = new CommentRound(commentRound);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  deleteCommentRound() {

    this.confirmationModalService.deleteCommentRound()
      .then(() => {
        this.dataService.deleteCommentRound(this.commentRound).subscribe(commentRound => {
          this.router.navigate(['frontpage']);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  get loading() {

    return this.commentRound == null || this.myComments == null || this.commentThreads == null;
  }

  get isEditorOrSuperUser(): boolean {

    return this.authorizationManager.user.superuser || this.commentRound.user.id === this.authorizationManager.user.id;
  }

  get toolType(): string {

    return this.commentRound.source.containerType;
  }

  onTabChange(event: NgbNavChangeEvent) {

    if (this.blockTabChange) {
      event.preventDefault();
      this.confirmationModalService.openEditInProgress()
        .then(() => {
          this.blockTabChange = false;
          this.editableService.cancel();
          this.nav.activeId = event.nextId;
        }, ignoreModalClose);
    } else {
      this.nav.activeId = event.nextId;
    }
  }

  get canStartCommentRound(): boolean {

    return this.commentRound.status === 'INCOMPLETE' && this.commentThreads && this.commentThreads.length > 0 && this.isEditorOrSuperUser;
  }

  get canEndCommenting(): boolean {

    return this.commentRound.status === 'INPROGRESS' && this.isEditorOrSuperUser;
  }

  get canDeleteCommentRound(): boolean {

    return this.authorizationManager.canDeleteCommentRound(this.commentRound);
  }

  get showExcelExport(): boolean {

    return this.authorizationManager.canExportExcel(this.commentRound);
  }

  get exportUrl(): string {

    return this.commentRound.url + '/?format=excel';
  }

  get showMenu(): boolean {

    return this.isEditorOrSuperUser || this.canSubscribe;
  }

  checkSubscription() {

    if (this.canSubscribe) {
      this.messagingService.getSubscription(this.commentRound.uri).subscribe(resource => {
        if (resource) {
          this.hasSubscription = true;
        } else {
          this.hasSubscription = false;
        }
      });
    }
  }

  get canSubscribe(): boolean {

    return this.configurationService.isMessagingEnabled &&
      this.userService.isLoggedIn() &&
      this.userService.user.containerUri === undefined;
  }

  get canAddSubscription(): boolean {

    return this.canSubscribe && !this.hasSubscription;
  }

  get canRemoveSubscription(): boolean {

    return this.canSubscribe && this.hasSubscription === true;
  }

  addSubscription() {

    this.confirmationModalService.openAddSubscription()
      .then(() => {
        this.messagingService.addSubscription(this.commentRound.uri, 'commentround').subscribe(success => {
          if (success) {
            this.hasSubscription = true;
          } else {
            this.hasSubscription = false;
            this.errorModalService.open('Submit error', 'Adding subscription failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  removeSubscription() {

    this.confirmationModalService.openRemoveSubscription()
      .then(() => {
        this.messagingService.deleteSubscription(this.commentRound.uri).subscribe(success => {
          if (success) {
            this.hasSubscription = false;
          } else {
            this.hasSubscription = true;
            this.errorModalService.open('Submit error', 'Subscription deletion failed.', null);
          }
        });
      }, ignoreModalClose);
  }

  changeTabControl(blockChange: boolean) {

    this.blockTabChange = blockChange;
  }

  refreshCommentRound() {

    this.dataService.getCommentRound(this.commentRound.id).subscribe(commentRound => {
      this.commentRound = commentRound;
    });
  }

  refreshCommentThreads() {

    this.refreshCommentRound();
    this.dataService.getCommentRoundCommentThreads(this.commentRound.id).subscribe(commentThreads => {
      this.commentThreads = commentThreads;
    });
  }

  refreshMyComments() {

    this.dataService.getCommentRoundCommenterComments(this.commentRound.id).subscribe(comments => {
      this.myComments = comments;
      this.goToResources();
    });
  }

  isMessagingEnabled(): boolean {

    return this.configurationService.isMessagingEnabled;
  }
}
