import { Localizable } from 'yti-common-ui/types/localization';
import { Status } from 'yti-common-ui/entities/status';

export interface BaseResourceType {

  id: string;
  url: string;
}

export interface CommentRoundSimpleType extends BaseResourceType {

  user?: UserType;
  label: string;
  description: string;
  sourceLabel: Localizable;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  created?: string;
  modified?: string;
  startDate?: string;
  endDate?: string;
  source: SourceType;
}

export interface CommentRoundType extends BaseResourceType {

  user?: UserType;
  label: string;
  description: string;
  sourceLabel: Localizable;
  status: string;
  fixedThreads: boolean;
  openThreads: boolean;
  created?: string;
  modified?: string;
  startDate?: string;
  endDate?: string;
  source: SourceType;
  organizations: OrganizationSimpleType[];
  commentThreads: CommentThreadSimpleType[];
}

export interface SourceType {

  id?: string;
  url?: string;
  containerType: string;
  containerUri: string;
}

export interface UserType {

  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface CommentSimpleType extends BaseResourceType {

  content: string;
  user?: UserType;
  proposedStatus: string;
  created?: string | null;
  modified?: string;
  parentComment?: CommentSimpleType;
}

export interface CommentType extends BaseResourceType {

  content: string;
  user?: UserType;
  proposedStatus: string;
  created?: string | null;
  modified?: string;
  commentThread: CommentThreadType;
  parentComment?: CommentSimpleType;
}

export interface CommentThreadType extends BaseResourceType {

  resourceUri: string;
  label: Localizable;
  description: Localizable;
  proposedText: string;
  currentStatus?: string;
  proposedStatus: string;
  user?: UserType;
  created?: string | null;
  commentRound: CommentRoundType;
  results?: CommentThreadResultType[];
}

export interface CommentThreadSimpleType {

  id?: string;
  url?: string;
  resourceUri?: string;
  label?: Localizable;
  description?: Localizable;
  proposedText?: string;
  currentStatus?: string;
  proposedStatus?: string;
  user?: UserType;
  created?: string | null;
  results?: CommentThreadResultType[];
}

export interface CommentThreadResultType {

  status: string;
  count: number;
  percentage: number;
}

export interface OrganizationType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
  commentRounds: CommentRoundSimpleType[];
}

export interface OrganizationSimpleType {

  id: string;
  prefLabel: Localizable;
  description: Localizable;
  url: string;
}

export interface IntegrationReourceType {

  id: string;
  uri: string;
  prefLabel: Localizable;
  description: Localizable;
  status: Status;
  type?: string;
  modified?: string;
}
