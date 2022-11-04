import { Localizable, Status } from '@vrk-yti/yti-common-ui';

export interface BaseResourceType {

  id: string;
  url: string;
  sequenceId: number;
  uri: string;
}

export interface ApiResponseType {

  meta: {
    message: string,
    code: number,
    entityIdentifier?: string
  };
}

export interface CommentRoundSimpleType extends BaseResourceType {

  user?: UserType;
  label: string;
  description: string;
  sourceLocalName?: string | null;
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
  sourceLocalName?: string | null;
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
  tempUsers: TempUserType[];
  commentThreads?: CommentThreadSimpleType[] | null;
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
  endStatus: string;
  created?: string | null;
  modified?: string | null;
  parentComment?: CommentSimpleType;
}

export interface CommentType extends BaseResourceType {

  content: string;
  user?: UserType;
  proposedStatus?: string;
  endStatus?: string;
  created?: string | null;
  modified?: string | null;
  commentThread: CommentThreadType;
  parentComment?: CommentSimpleType;
}

export interface CommentThreadType extends BaseResourceType {

  resourceUri: string;
  label: Localizable;
  description: Localizable;
  localName?: string | null;
  proposedText: string;
  currentStatus?: string;
  proposedStatus: string;
  user?: UserType;
  created?: string | null;
  commentRound: CommentRoundType;
  results?: CommentThreadResultType[];
  commentCount: number;
}

export interface CommentThreadSimpleType {

  id?: string;
  sequenceId?: number;
  url?: string;
  resourceUri?: string;
  label?: Localizable;
  description?: Localizable;
  localName?: string | null;
  proposedText?: string;
  currentStatus?: string;
  proposedStatus?: string;
  user?: UserType;
  created?: string | null;
  results?: CommentThreadResultType[];
  commentCount: number;
}

export interface CommentThreadResultType {

  status: string;
  count: number;
  percentage: string;
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

export interface TempUserType {

  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  commentRoundUri: string;
}

export interface IntegrationResourceType {

  id: string;
  uri: string;
  prefLabel: Localizable;
  description: Localizable;
  localName?: string | null;
  status: Status;
  type?: string;
  modified?: string;
}
