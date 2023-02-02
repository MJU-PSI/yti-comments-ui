import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LanguageService } from '../../services/language.service';
import { CommentSimple } from '../../entities/comment-simple';
import { DataService } from '../../services/data.service';
import { CommentThreadType, CommentType } from '../../services/api-schema';
import { v4 as uuid } from 'uuid';
import { CommentsErrorModalService } from './error-modal.service';
import { BehaviorSubject } from 'rxjs';
import { ignoreModalClose } from '@mju-psi/yti-common-ui';
import { CommentsConfirmationModalService } from './confirmation-modal.service';
import { AuthorizationManager } from '../../services/authorization-manager';
import { CommentRound } from '../../entities/commentround';
import { Moment } from 'moment';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-hierarchical-comment',
  styleUrls: ['./hiararchical-comment-listitem.component.scss'],
  template: `
    <div class="row">
      <div>
        <i id="hierarchy_code_expand" [hidden]="!hasChildComments || expanded" class="collapseIcon fa fa-plus" (click)="expand()"></i>
        <i id="hierarchy_code_collapse" [hidden]="!hasChildComments || collapsed" class="collapseIcon fa fa-minus" (click)="collapse()"></i>
        <i id="hierarchy_code_aligner" [hidden]="hasChildComments" class="collapseIcon fa"></i>
      </div>

      <div class="comment" x-ms-format-detection="none">
        <span class="name">{{ this.getCommentUserDisplayName() }}</span>
        <span *ngIf="comment.created && comment.modified && isSameMoment(comment.created, comment.modified)"
              class="created">{{ comment.createdDisplayValue}}</span>
        <span *ngIf="comment.created && comment.modified && !isSameMoment(comment.created, comment.modified)"
              class="modified">{{ comment.modifiedDisplayValue}}</span>
        <span *ngIf="comment.created && comment.modified && !isSameMoment(comment.created, comment.modified)">&nbsp;</span>
        <span *ngIf="comment.created && comment.modified && !isSameMoment(comment.created, comment.modified)" translate>(modified)</span>
        <span *ngIf="comment.proposedStatus != null && comment.proposedStatus === comment.endStatus"
              class="proposedStatus">, {{ comment.endStatus | translate }}</span>
        <span *ngIf="comment.proposedStatus !== comment.endStatus"
              class="proposedStatus">, <s>{{ comment.proposedStatus | translate }}</s> &#x2192; {{ comment.endStatus | translate }}</span>
        <span class="actions"
              *ngIf="!this.commenting && !this.updating && canComment"
              [id]="'comment_' + this.comment.id + '_reply_button'"
              (click)="toggleCommenting()"
              translate>Reply</span>
        <span class="actions"
              *ngIf="!this.commenting && !this.updating && canModifyOrDeleteComment && !hasChildComments && comment.parentComment"
              [id]="'comment_' + this.comment.id + '_modify_button'"
              (click)="toggleUpdatingComment()"
              translate>Modify</span>
        <span class="actions"
              *ngIf="!this.commenting && !this.updating && canModifyOrDeleteComment && !hasChildComments && comment.parentComment"
              [id]="'comment_' + this.comment.id + '_delete_button'"
              (click)="deleteComment()"
              translate>Delete</span>
        <br>
        <span class="content">{{ comment.content }}</span>
      </div>
    </div>

    <div class="row">
      <app-literal-input *ngIf="this.commenting"
                         class="input col-md-6"
                         [isEditing]="this.commenting"
                         [id]="'comment_' + this.comment.id + '_input'"
                         [(ngModel)]="this.commentContent"></app-literal-input>
      <div class="col-md-6">
        <button *ngIf="this.commenting && canComment"
                [id]="'comment_' + this.comment.id + '_send_button'"
                class="btn btn-secondary-action"
                [disabled]="commentContent.trim().length == 0"
                type="button"
                (click)="sendComment()">
          <span translate>Send</span>
        </button>
        <button *ngIf="this.commenting"
                [id]="'comment_' + this.comment.id + '_cancel_button'"
                class="btn btn-link cancel"
                type="button"
                (click)="toggleCommenting()">
          <span translate>Cancel</span>
        </button>
      </div>
    </div>

    <div class="row">
      <app-literal-input *ngIf="this.updating"
                         class="input col-md-6"
                         [isEditing]="updating"
                         [id]="'comment_' + this.comment.id + '_input'"
                         [(ngModel)]="comment.content"></app-literal-input>
      <div class="col-md-6">
        <button *ngIf="this.updating && canComment"
                [id]="'comment_' + this.comment.id + '_send_button'"
                class="btn btn-secondary-action"
                [disabled]="comment.content.trim().length == 0"
                type="button"
                (click)="updateComment()">
          <span translate>Save</span>
        </button>
        <button *ngIf="this.updating"
                [id]="'comment_' + this.comment.id + '_cancel_button'"
                class="btn btn-link cancel"
                type="button"
                (click)="toggleUpdatingComment()">
          <span translate>Cancel</span>
        </button>
      </div>
    </div>

    <ul *ngIf="expanded && hasChildComments">
      <li class="child-comment" *ngFor="let childComment of childComments; trackBy: commentIdentity">
        <app-hierarchical-comment (refreshComments)="emitRefreshComments()"
                                  (expandComment)="emitExpandComment($event)"
                                  (collapseComment)="emitCollapseComment($event)"
                                  [id]="childComment.id"
                                  [comment]="childComment"
                                  [comments]="comments"
                                  [commentRound]="commentRound"
                                  [commentThreadId]="commentThreadId"
                                  [commentThreadSequenceId]="commentThreadSequenceId"
                                  [activeCommentId$]="activeCommentId$"
                                  [canComment]="canComment"
                                  [canModifyOrDeleteComment]="canModifyOrDeleteInlineComment(childComment)"></app-hierarchical-comment>
      </li>
    </ul>
  `
})
export class HierarchicalCommentListitemComponent implements OnInit {

  @Input() comment: CommentSimple;
  @Input() comments: CommentSimple[];
  @Input() commentRound: CommentRound;
  @Input() commentThreadId: string;
  @Input() commentThreadSequenceId: number;
  @Input() canModifyOrDeleteComment: boolean;
  @Input() canComment: boolean;
  @Input() activeCommentId$ = new BehaviorSubject<string | null>(null);
  @Output() refreshComments = new EventEmitter<string>();
  @Output() expandComment = new EventEmitter<string>();
  @Output() collapseComment = new EventEmitter<string>();

  commenting = false;
  commentContent = '';
  updating = false;

  constructor(public languageService: LanguageService,
              private translateService: TranslateService,
              private dataService: DataService,
              private errorModalService: CommentsErrorModalService,
              private confirmationModalService: CommentsConfirmationModalService,
              private authorizationManager: AuthorizationManager) {
  }

  ngOnInit() {

    this.activeCommentId$.subscribe(activeCommentId => {
      if (activeCommentId !== this.comment.id) {
        this.commentContent = '';
        this.commenting = false;
      }
    });
  }

  toggleCommenting() {

    if (this.commenting) {
      this.commentContent = '';
    }
    if (!this.commenting) {
      this.commentContent = '';
      this.activeCommentId$.next(this.comment.id);
    }
    this.commenting = !this.commenting;
  }

  toggleUpdatingComment() {

    if (this.updating) {
      this.commentContent = '';
    }
    if (!this.updating) {
      this.commentContent = '';
      this.activeCommentId$.next(this.comment.id);
    }
    this.updating = !this.updating;
  }

  updateComment() {

    const commentToUpdate: CommentType = <CommentType>{
      commentThread: <CommentThreadType>{ id: this.commentThreadId },
      content: this.comment.content,
      parentComment: this.comment.parentComment ? this.comment.parentComment.serialize() : null,
      id: this.comment.id
    };

    this.dataService.updateComment(this.commentRound.id, commentToUpdate).subscribe(updatedComment => {
      this.toggleUpdatingComment();
      this.comments.push(updatedComment as CommentSimple);
      this.refreshComments.emit(this.commentThreadId);
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  deleteComment() {

    this.confirmationModalService.deleteComment()
      .then(() => {
        const newComment: CommentType = <CommentType>{
          commentThread: <CommentThreadType>{ id: this.commentThreadId },
          content: this.commentContent,
          parentComment: this.comment.parentComment ? this.comment.parentComment.serialize() : null,
          id: this.comment.id
        };

        this.dataService.deleteComment(this.commentRound.id, newComment).subscribe(() => {
          this.refreshComments.emit(this.commentThreadId);
        }, error => {
          this.errorModalService.openSubmitError(error);
        });
      }, ignoreModalClose);
  }

  sendComment() {

    const id: string = uuid();
    const newComment: CommentType = <CommentType>{
      commentThread: <CommentThreadType>{ id: this.commentThreadId },
      content: this.commentContent,
      parentComment: this.comment.serialize(),
      id: id
    };

    this.dataService.createComment(this.commentRound.id, newComment).subscribe(createdComment => {
      this.toggleCommenting();
      this.comments.push(createdComment as CommentSimple);
      this.refreshComments.emit(this.commentThreadId);
      this.emitExpandComment(this.comment.id);
    }, error => {
      this.errorModalService.openSubmitError(error);
    });
  }

  get hasChildComments(): boolean {

    return this.childComments && this.childComments.length > 0;
  }

  get childComments(): CommentSimple[] {

    return this.comments.filter(comment => comment.parentComment != null && comment.parentComment.id === this.comment.id);
  }

  canModifyOrDeleteInlineComment(comment: CommentSimple): boolean {

    return (this.authorizationManager.user.id === comment.user.id) &&
      this.commentRound.status === 'INPROGRESS';
  }

  commentIdentity(index: number, item: CommentSimple) {

    return item.id;
  }

  isSameMoment(moment1: Moment, moment2: Moment): boolean {

    return moment1.valueOf() === moment2.valueOf();
  }

  get expanded() {

    return this.comment.expanded;
  }

  get collapsed() {

    return !this.expanded;
  }

  expand() {

    this.emitExpandComment(this.comment.id);
  }

  collapse() {

    this.emitCollapseComment(this.comment.id);
  }

  emitRefreshComments() {

    this.refreshComments.emit(this.commentThreadId);
  }

  emitExpandComment(commentId: string) {

    this.expandComment.emit(commentId);
  }

  emitCollapseComment(commentId: string) {

    this.collapseComment.emit(commentId);
  }

  getCommentUserDisplayName(): string {

    if (this.comment && this.comment.user) {
      const userDisplayName = this.comment.user.getDisplayName();
      if (userDisplayName.length > 0) {
        return userDisplayName;
      }
    }
    return this.translateService.instant('Removed user');
  }
}
