import { CommentRoundType } from '../services/api-schema';
import { formatDate, formatDateTime, formatDisplayDateTime, parseDate } from '../utils/date';
import { Moment, utc } from 'moment';
import { AbstractResource } from './abstract-resource';
import { Source } from './source';
import { Location, Localizable } from '@mju-psi/yti-common-ui';
import { OrganizationSimple } from './organization-simple';
import { User } from './user';
import { EditableEntity } from './editable-entity';
import { CommentThreadSimple } from './commentthread-simple';
import { LanguageService } from '../services/language.service';
import { TempUser } from './tempuser';

export class CommentRound extends AbstractResource implements EditableEntity {

  user: User;
  label: string;
  sourceLabel: Localizable = {};
  sourceLocalName: string | null;
  description: string;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  source: Source;
  created: Moment | null = null;
  modified: Moment | null = null;
  startDate: Moment | null = null;
  endDate: Moment | null = null;
  organizations: OrganizationSimple[] = [];
  tempUsers: TempUser[] = [];
  commentThreads: CommentThreadSimple[] = [];

  constructor(data: CommentRoundType) {

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
    if (data.organizations) {
      this.organizations = (data.organizations || []).map(org => new OrganizationSimple(org));
    }
    if (data.tempUsers) {
      this.tempUsers = (data.tempUsers || []).map(tempUser => new TempUser(tempUser));
    }
    if (data.commentThreads) {
      this.commentThreads = (data.commentThreads || []).map(commentThread => new CommentThreadSimple(commentThread));
    }
  }

  get createdDisplayValue(): string {

    return formatDisplayDateTime(this.created);
  }

  get modifiedDisplayValue(): string {

    return formatDisplayDateTime(this.modified);
  }

  getDisplayName(localizer: LanguageService, useUILanguage: boolean = false): string {

    if (!localizer.isLocalizableEmpty(this.sourceLabel)) {
      return localizer.translate(this.sourceLabel, useUILanguage);
    } else if (this.sourceLocalName) {
      return this.sourceLocalName;
    }
    return '';
  }

  get location(): Location[] {

    return [
      {
        localizationKey: 'Comment round',
        label: undefined,
        value: undefined,
        route: this.route
      }
    ];
  }

  get route(): any[] {

    return [
      'round',
      {
        round: this.sequenceId
      }
    ];
  }

  serialize(): CommentRoundType {

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
      source: this.source.serialize(),
      organizations: this.organizations.map(org => org.serialize()),
      tempUsers: (this.tempUsers || []).map(tempUser => tempUser.serialize()),
      commentThreads: this.commentThreads ? this.commentThreads.map(commentThread => commentThread.serialize()) : null
    };
  }

  clone(): CommentRound {

    return new CommentRound(this.serialize());
  }

  getUser(): User {

    return this.user;
  }

  allowUserEdit(): boolean {

    return true;
  }

  allowOrganizationEdit(): boolean {

    return this.status === 'INPROGRESS' && !this.fixedThreads;
  }

  allowOrganizationComment(): boolean {

    return this.status === 'INPROGRESS';
  }

  getOwningOrganizationIds(): string[] {

    return this.organizations.map(org => org.id);
  }

  getContainerUri(): string {

    return this.uri;
  }
}
