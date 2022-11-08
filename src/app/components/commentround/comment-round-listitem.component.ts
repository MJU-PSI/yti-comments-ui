import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { CommentRound } from '../../entities/commentround';
import { formatDisplayDateRange } from '../../utils/date';
import { Localizable } from '@goraresult/yti-common-ui';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-comment-round-listitem',
  styleUrls: ['./comment-round-listitem.component.scss'],
  template: `
    <div id="{{getIdIdentifier() + '_view_commentround'}}">
      <span class="type"><i class="material-icons icon-orange">{{ typeIcon }}</i>{{ containerTypeLabel }}</span>

      <app-commentround-status class="status"
                               [status]="commentRound.status"></app-commentround-status>
      <a class="name" [routerLink]="commentRound.route">{{ commentRound.label }}</a>

      <div>
        <span translate>Commenting period</span><span>: {{ commentingPeriod }}</span>
      </div>

      <span class="information-domains">
        <span class="badge badge-light">
          {{ commentRound.sourceLabel | translateValue }}
        </span>
      </span>

      <div *ngIf="commentRound.description as descriptionText" class="description-component-container" style="width: calc(100% - 260px);">
        <app-expandable-text [text]="descriptionText"></app-expandable-text>
      </div>

      <ul class="organizations dot-separated-list">
        <li class="organization" *ngFor="let org of commentRound.organizations">
          {{org.prefLabel | translateValue:true}}
        </li>
      </ul>
    </div>
  `
})

export class CommentRoundListitemComponent {

  @Input() commentRound: CommentRound;

  constructor(private router: Router,
              public languageService: LanguageService,
              private translateService: TranslateService) {
  }

  getIdIdentifier() {

    return `${this.commentRound.id}`;
  }

  get commentingPeriod(): string {

    return formatDisplayDateRange(this.commentRound.startDate, this.commentRound.endDate);
  }

  get typeIcon(): string {
    const type: string = this.commentRound.source.containerType;
    switch (type) {
      case 'codelist':
        return 'account_balance';
      case 'terminology':
        return 'chat_bubble';
      case 'datamodel':
        return 'view_quilt';
      default:
        return 'account_balance';
    }
  }

  get containerTypeLabel(): Localizable {
    const type: string = this.commentRound.source.containerType;
    return this.translateService.instant(type + '-type');
  }
}
