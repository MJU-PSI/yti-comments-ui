import { Localizable, Localizer, labelNameToResourceIdIdentifier } from '@vrk-yti/yti-common-ui';
import { OrganizationType } from '../services/api-schema';
import { CommentRoundSimple } from './commentround-simple';

export class Organization {

  id: string;
  url: string;
  prefLabel: Localizable;
  description: Localizable;
  commentRounds: CommentRoundSimple[];

  constructor(data: OrganizationType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    this.url = data.url;
    if (data.commentRounds) {
      this.commentRounds = (data.commentRounds || []).map(cr => new CommentRoundSimple(cr));
    }
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  getIdIdentifier(localizer: Localizer): string {
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): OrganizationType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: {...this.prefLabel},
      description: {...this.description},
      commentRounds: (this.commentRounds || []).map(cr => cr.serialize())
    };
  }

  clone(): Organization {
    return new Organization(this.serialize());
  }
}
