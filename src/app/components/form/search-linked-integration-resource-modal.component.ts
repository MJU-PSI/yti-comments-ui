import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat, Observable } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entity/integration-resource';
import { containerTypes } from '../common/containertypes';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-search-linked-source-modal',
  styleUrls: ['./search-linked-integration-resource-modal.component.scss'],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <a><i id="close_modal_link" class="fa fa-times" (click)="cancel()"></i></a>
        <span>{{titleLabel}}</span>
      </h4>
    </div>
    <div class="modal-body full-height">

      <div *ngIf="!containerUri">
        <div>
          <span class="search-label search-label with-info" translate>Select tool</span>
          <app-information-symbol [infoText]="'INFO_TEXT_SOURCE_FILTER_RESULTS'"></app-information-symbol>
        </div>

        <app-filter-dropdown class="d-inline-block mb-3"
                             id="integration_filter_dropdown"
                             [filterSubject]="containerType$"
                             [options]="containerTypeOptions"></app-filter-dropdown>
      </div>

      <div class="row mb-2">
        <div class="col-12">
          <div class="input-group input-group-lg input-group-search">
            <input #searchInput id="search_linked_source_input" type="text" class="form-control"
                   [placeholder]="searchLabel"
                   [(ngModel)]="search"/>
          </div>
        </div>
      </div>

      <div class="row full-height">
        <div class="col-12">
          <div class="content-box">
            <div class="search-results">
              <div *ngFor="let resource of searchResults$ | async; let last = last"
                   id="{{resource.id + '_coment_round_link'}}"
                   class="search-result"
                   (click)="select(resource)">
                <div class="content" [class.last]="last">
                  <span class="title" [innerHTML]="resource.getDisplayName(languageService, useUILanguage)"></span>
                  <span class="body" [innerHTML]="resource.getDescription(languageService, useUILanguage)"></span>
                  <span class="body" [innerHTML]="resource.uri"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">

      <button id="cancel_modal_button"
              type="button"
              class="btn btn-link cancel"
              (click)="cancel()">
        <span>Cancel</span>
      </button>
    </div>
  `
})
export class SearchLinkedIntegrationResourceModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() titleLabel: string;
  @Input() searchLabel: string;
  @Input() useUILanguage: boolean;
  @Input() containerUri: string | null;
  @Input() containerType: string;

  containerTypeOptions: FilterOptions<string>;

  resources$: Observable<IntegrationResource[]>;
  resources: IntegrationResource[];
  searchResults$: Observable<IntegrationResource[]>;

  containerType$ = new BehaviorSubject<string | null>(null);
  search$ = new BehaviorSubject('');

  loading = false;

  constructor(public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.containerTypeOptions = [null, ...containerTypes].map(containerType => ({
      value: containerType,
      name: () => this.translateService.instant(containerType ? containerType : 'Select interoperability tool'),
      idIdentifier: () => status ? status : 'select_source_container_type'
    }));

    if (this.containerUri) {
      this.resources$ = this.dataService.getResources(this.containerType, this.containerUri, this.languageService.language);
      this.filterResources();
    } else {
      this.containerType$.subscribe(selectedContainerType => {
        if (selectedContainerType != null) {
          this.resources$ = this.dataService.getContainers(selectedContainerType, this.languageService.language);
          this.filterResources();
        }
      });
    }
  }

  filterResources() {
    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    this.searchResults$ = combineLatest(this.resources$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([integrationResources, search]) => {
          return integrationResources.filter(integrationResource => {
            const label = this.languageService.translate(integrationResource.prefLabel, true);
            const searchMatches = !search || label.toLowerCase().indexOf(search.toLowerCase()) !== -1;
            const isNotRestricted = !contains(this.restricts, integrationResource.id);
            return searchMatches && isNotRestricted;
          });
        })
      );
  }

  select(resource: IntegrationResource) {
    this.modal.close(resource);
  }

  ngAfterViewInit() {
    this.searchInput.nativeElement.focus();
  }

  get search() {
    return this.search$.getValue();
  }

  set search(value: string) {
    this.search$.next(value);
  }

  cancel() {
    this.modal.dismiss('cancel');
  }
}

@Injectable()
export class SearchLinkedIntegrationResourceModalService {

  constructor(private modalService: ModalService) {
  }

  open(containerType: string,
       containerUri: string,
       titleLabel: string,
       searchLabel: string,
       restrictResourceIds: string[],
       useUILanguage: boolean = false): Promise<IntegrationResource> {

    const modalRef = this.modalService.open(SearchLinkedIntegrationResourceModalComponent, { size: 'sm' });
    const instance = modalRef.componentInstance as SearchLinkedIntegrationResourceModalComponent;
    instance.containerType = containerType;
    instance.containerUri = containerUri;
    instance.titleLabel = titleLabel;
    instance.searchLabel = searchLabel;
    instance.restricts = restrictResourceIds;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
