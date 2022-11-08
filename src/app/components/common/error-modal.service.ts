import { ErrorModalService } from '@goraresult/yti-common-ui';
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class CommentsErrorModalService {

  constructor(private errorModalService: ErrorModalService) {
  }

  openSubmitError(error: any) {

    const showDebug = false;

    if (error instanceof HttpErrorResponse) {
      const body = error.error;

      this.errorModalService.openWithOptions({
        title: 'Submit error',
        body: body.meta.message,
        bodyParams: { identifier: body.meta.entityIdentifier },
        err: showDebug ? error : undefined
      });
    } else {
      this.errorModalService.openSubmitError(showDebug ? error : undefined);
    }
  }

  open(title: string, body: string, error?: any) {

    this.errorModalService.open(title, body, error);
  }
}
