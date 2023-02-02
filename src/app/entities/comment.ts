import { CommentType } from '../services/api-schema';
import { formatDateTime, formatDisplayDateTime } from '../utils/date';
import { Moment, utc } from 'moment';
import { AbstractResource } from './abstract-resource';
import { CommentSimple } from './comment-simple';
import { Location } from '@mju-psi/yti-common-ui';
import { User } from './user';
import { CommentThread } from './commentthread';

export class Comment extends AbstractResource {

  user: User;
  content: string;
  proposedStatus: string;
  endStatus: string;
  created: Moment | null = null;
  modified: Moment | null = null;
  commentThread: CommentThread;
  parentComment: CommentSimple;
  expanded: boolean;

  constructor(data: CommentType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.content = data.content;
    if (data.proposedStatus) {
      this.proposedStatus = data.proposedStatus;
    }
    if (data.endStatus) {
      this.endStatus = data.endStatus;
    }
    if (data.created) {
      this.created = utc(data.created);
    }
    if (data.modified) {
      this.modified = utc(data.modified);
    }
    this.commentThread = new CommentThread(data.commentThread);
    if (data.parentComment) {
      this.parentComment = new CommentSimple(data.parentComment);
    }
    this.expanded = true;
  }

  get route(): any[] {

    return [
      ...this.commentThread.location,
      'round',
      {
        round: this.commentThread.commentRound.sequenceId,
        thread: this.commentThread.sequenceId,
        comment: this.sequenceId
      }
    ];
  }

  get location(): Location[] {

    return [
      ...this.commentThread.location,
      {
        localizationKey: 'Comment',
        label: undefined,
        value: undefined,
        route: this.route
      }
    ];
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  get modifiedDisplayValue(): string {

    return formatDisplayDateTime(this.modified);
  }

  serialize(): CommentType {

    return {
      id: this.id,
      url: this.url,
      uri: this.uri,
      sequenceId: this.sequenceId,
      content: this.content,
      user: this.user ? this.user.serialize() : undefined,
      proposedStatus: this.proposedStatus,
      endStatus: this.endStatus,
      created: formatDateTime(this.created),
      modified: formatDateTime(this.modified),
      parentComment: this.parentComment ? this.parentComment.serialize() : undefined,
      commentThread: this.commentThread.serialize()
    };
  }

  clone(): Comment {

    return new Comment(this.serialize());
  }
}
