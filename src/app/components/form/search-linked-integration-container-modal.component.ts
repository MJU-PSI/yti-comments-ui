import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains, ModalService, FilterOptions, allStatuses, Status, comparingLocalizable, comparingPrimitive } from '@goraresult/yti-common-ui';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entities/integration-resource';
import { containerTypes } from '../common/containertypes';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from '../../services/configuration.service';

@Component({
  selector: 'app-search-linked-container-modal',
  templateUrl: './search-linked-integration-container-modal.component.html',
  styleUrls: ['./search-linked-integration-container-modal.component.scss']
})
export class SearchLinkedContainerModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() useUILanguage: boolean;
  @Input() containerType: string | null;

  searchLabel: string;
  instructionText: string;
  titleLabel: string;

  statusOptions: FilterOptions<Status>;
  containerTypeOptions: FilterOptions<string>;

  resources: IntegrationResource[];

  status$ = new BehaviorSubject<Status | null>(null);
  containerType$ = new BehaviorSubject<string | null>(null);
  search$ = new BehaviorSubject('');
  searchResults$ = new BehaviorSubject<IntegrationResource[]>([]);

  loading = false;

  constructor(public configurationService: ConfigurationService,
              public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private translateService: TranslateService) {
  }

  ngOnInit() {

    this.searchLabel = this.translateService.instant('Search term');

    this.containerTypeOptions = [null, ...containerTypes].map(containerType => ({
      value: containerType,
      name: () => this.translateService.instant(containerType ? containerType : 'Select tool'),
      idIdentifier: () => containerType ? containerType : 'select_source_container_type'
    }));

    this.statusOptions = [null, ...allStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    this.titleLabel = this.translateService.instant('Select source');
    this.instructionText = this.translateService.instant('HELP_TEXT_COMMENTROUND_SOURCE_MODAL_INSTRUCTION');
    this.containerType$.subscribe(selectedContainerType => {
      if (selectedContainerType != null) {
        this.loading = true;
        this.dataService.getContainers(selectedContainerType, this.languageService.language).subscribe(resources => {
          this.resources = resources;
          this.filterResources();
        });
      }
    });
  }

  get hasContent(): boolean {

    return this.searchResults$.getValue().length > 0;
  }

  get hasContainerType(): boolean {

    return this.containerType$.getValue() != null || this.containerType != null;
  }

  filterResources() {

    this.loading = true;

    this.searchResults$.next([]);

    const initialSearch = this.search$.pipe(take(1));
    const debouncedSearch = this.search$.pipe(skip(1), debounceTime(500));

    combineLatest(this.status$, concat(initialSearch, debouncedSearch))
      .pipe(
        tap(() => this.loading = false),
        map(([status, search]) => {
          return this.resources.filter(integrationResource => {
            const label = this.languageService.translate(integrationResource.prefLabel, true);
            const searchMatches = !search ||
              label.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
              (integrationResource.uri !== undefined && integrationResource.uri.toLowerCase().indexOf(search.toLowerCase()) !== -1);
            const isNotRestricted = !contains(this.restricts, integrationResource.uri);
            const statusMatches = !status || integrationResource.status === status;
            return searchMatches && isNotRestricted && statusMatches;
          }).sort(comparingPrimitive<IntegrationResource>(
            integrationResource => this.languageService.isLocalizableEmpty(integrationResource.prefLabel))
            .andThen(comparingPrimitive<IntegrationResource>(integrationResource =>
              this.languageService.isLocalizableEmpty(integrationResource.prefLabel) ? integrationResource.uri.toLowerCase() : null))
            .andThen(comparingLocalizable<IntegrationResource>(this.languageService,
              integrationResource => integrationResource.prefLabel ? integrationResource.prefLabel : {})));
        })
      ).subscribe(results => {
      this.searchResults$.next(results);
    });
  }

  select(resource: IntegrationResource) {

    resource.type = this.containerType$.value ? this.containerType$.value : undefined;
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
export class SearchLinkedContainerModalService {

  constructor(private modalService: ModalService) {
  }

  open(containerType: string | null,
       restrictedResourceUris: string[],
       useUILanguage: boolean = false): Promise<IntegrationResource> {

    const modalRef = this.modalService.open(SearchLinkedContainerModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as SearchLinkedContainerModalComponent;
    instance.containerType = containerType;
    instance.restricts = restrictedResourceUris;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}
