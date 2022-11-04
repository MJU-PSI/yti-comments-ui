import { CommentRoundSimpleType } from '../services/api-schema';
import { formatDate, formatDateTime, parseDate } from '../utils/date';
import { Moment, utc } from 'moment';
import { AbstractResource } from './abstract-resource';
import { Source } from './source';
import { Localizable } from '@vrk-yti/yti-common-ui';
import { User } from './user';

export class CommentRoundSimple extends AbstractResource {

  user: User;
  label: string;
  sourceLocalName: string | null;
  sourceLabel: Localizable = {};
  description: string;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  source: Source;
  created: Moment | null = null;
  modified: Moment | null = null;
  startDate: Moment | null = null;
  endDate: Moment | null = null;

  constructor(data: CommentRoundSimpleType) {

    super(data);
    if (data.user) {
      this.user = new User(data.user);
    }
    this.label = data.label;
    this.description = data.description;
    this.status = data.status;
    this.fixedThreads = data.fixedThreads;
    this.openThreads = data.openThreads;
    if (data.sourceLocalName) {
      this.sourceLocalName = data.sourceLocalName;
    }
    this.sourceLabel = data.sourceLabel || {};
    if (data.source) {
      this.source = new Source(data.source);
    }
    if (data.created) {
      this.created = utc(data.created);
    }
    if (data.modified) {
      this.modified = utc(data.modified);
    }
    if (data.startDate) {
      this.startDate = parseDate(data.startDate);
    }
    if (data.endDate) {
      this.endDate = parseDate(data.endDate);
    }
  }

  serialize(): CommentRoundSimpleType {
    return {
      id: this.id,
      url: this.url,
      uri: this.uri,
      sequenceId: this.sequenceId,
      user: this.user ? this.user.serialize() : undefined,
      status: this.status,
      created: formatDateTime(this.created),
      modified: formatDateTime(this.modified),
      startDate: formatDate(this.startDate),
      endDate: formatDate(this.endDate),
      label: this.label,
      description: this.description,
      sourceLocalName: this.sourceLocalName,
      sourceLabel: { ...this.sourceLabel },
      fixedThreads: this.fixedThreads,
      openThreads: this.openThreads,
      source: this.source.serialize()
    };
  }
}
