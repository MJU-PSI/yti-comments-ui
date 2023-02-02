import { ConfirmationModalService } from '@mju-psi/yti-common-ui';
import { Injectable } from '@angular/core';

@Injectable()
export class CommentsConfirmationModalService {

  constructor(private confirmationModalService: ConfirmationModalService) {
  }

  openEditInProgress() {
    return this.confirmationModalService.openEditInProgress();
  }

  startCommentRound() {
    return this.confirmationModalService.open('START COMMENT ROUND?', '');
  }

  closeCommentRound() {
    return this.confirmationModalService.open('CLOSE COMMENT ROUND?', '');
  }

  deleteCommentRound() {
    return this.confirmationModalService.open('DELETE COMMENT ROUND?', '');
  }

  deleteCommentThread() {
    return this.confirmationModalService.open('DELETE COMMENT THREAD?', '');
  }

  deleteComment() {
    return this.confirmationModalService.open('DELETE COMMENT?', '');
  }

  sendPartialComments() {
    return this.confirmationModalService.open('SEND COMMENTS?',
      '', 'You have not commented all resources. Are you sure you want to send partial comments?');
  }

  openAddSubscription() {
    return this.confirmationModalService.open('ADD EMAIL SUBSCRIPTION TO RESOURCE REGARDING CHANGES?', undefined, '');
  }

  openRemoveSubscription() {
    return this.confirmationModalService.open('REMOVE EMAIL SUBSCRIPTION TO RESOURCE?', undefined, '');
  }

  openToggleNotifications(enable: boolean) {
    if (enable) {
      return this.confirmationModalService.open('ARE YOU SURE YOU WANT TO ENABLE THE NOTIFICATION EMAIL SUBSCRIPTION?', undefined, '');
    } else {
      return this.confirmationModalService.open('ARE YOU SURE YOU WANT TO DISABLE THE NOTIFICATION EMAIL SUBSCRIPTION?', undefined, '');
    }
  }
}
