import { Localizable, Localizer, labelNameToResourceIdIdentifier } from '@goraresult/yti-common-ui';
import { OrganizationSimpleType } from '../services/api-schema';

export class OrganizationSimple {

  id: string;
  url: string;
  prefLabel: Localizable;
  description: Localizable;

  constructor(data: OrganizationSimpleType) {
    this.id = data.id;
    this.prefLabel = data.prefLabel || {};
    this.description = data.description || {};
    this.url = data.url;
  }

  getDisplayName(localizer: Localizer, useUILanguage: boolean = false): string {
    return localizer.translate(this.prefLabel, useUILanguage);
  }

  getIdIdentifier(localizer: Localizer): string {
    const prefLabel = localizer.translate(this.prefLabel);
    return `${labelNameToResourceIdIdentifier(prefLabel)}`;
  }

  serialize(): OrganizationSimpleType {
    return {
      id: this.id,
      url: this.url,
      prefLabel: { ...this.prefLabel },
      description: { ...this.description }
    };
  }

  clone(): OrganizationSimple {
    return new OrganizationSimple(this.serialize());
  }
}
