import { AfterViewInit, Component, ElementRef, Injectable, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, combineLatest, concat } from 'rxjs';
import { LanguageService } from '../../services/language.service';
import { contains } from 'yti-common-ui/utils/array';
import { ModalService } from '../../services/modal.service';
import { DataService } from '../../services/data.service';
import { debounceTime, map, skip, take, tap } from 'rxjs/operators';
import { IntegrationResource } from '../../entity/integration-resource';
import { FilterOptions } from 'yti-common-ui/components/filter-dropdown.component';
import { TranslateService } from '@ngx-translate/core';
import { regularStatuses, Status } from 'yti-common-ui/entities/status';
import { IntegrationResourceType } from '../../services/api-schema';
import { ConfigurationService } from '../../services/configuration.service';
import { comparingLocalizable, comparingPrimitive } from 'yti-common-ui/utils/comparator';

@Component({
  selector: 'app-search-linked-source-multi-modal',
  templateUrl: './search-linked-integration-resource-multi-modal.component.html',
  styleUrls: ['./search-linked-integration-resource-multi-modal.component.scss']
})
export class SearchLinkedIntegrationResourceMultiModalComponent implements AfterViewInit, OnInit {

  @ViewChild('searchInput') searchInput: ElementRef;

  @Input() restricts: string[];
  @Input() useUILanguage: boolean;
  @Input() containerUri: string;
  @Input() containerType: string;
  @Input() openThreads: boolean | null;

  searchLabel: string;
  instructionText: string;
  titleLabel: string;
  selectedResources: IntegrationResource[] = [];
  resources: IntegrationResource[];
  statusOptions: FilterOptions<Status>;
  loading = false;

  status$ = new BehaviorSubject<Status | null>(null);
  search$ = new BehaviorSubject('');
  searchResults$ = new BehaviorSubject<IntegrationResource[]>([]);

  constructor(public configurationService: ConfigurationService,
              public modal: NgbActiveModal,
              public languageService: LanguageService,
              private dataService: DataService,
              private translateService: TranslateService) {
  }

  ngOnInit() {

    this.searchLabel = this.translateService.instant('Search term');

    this.statusOptions = [null, ...regularStatuses].map(status => ({
      value: status,
      name: () => this.translateService.instant(status ? status : 'All statuses'),
      idIdentifier: () => status ? status : 'all_selected'
    }));

    this.titleLabel = this.translateService.instant('Select resource');
    this.instructionText = this.translateService.instant('HELP_TEXT_COMMENTTHREAD_RESOURCE_MODAL_INSTRUCTION');
    this.loading = true;
    this.dataService.getResources(this.containerType, this.containerUri, this.languageService.language).subscribe(resources => {
      this.resources = resources;
      this.filterResources();
    });
  }

  get hasContent(): boolean {

    return this.searchResults$.getValue().length > 0;
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
              this.languageService.isLocalizableEmpty(integrationResource.prefLabel) ? integrationResource.localName : null))
            .andThen(comparingPrimitive<IntegrationResource>(integrationResource =>
              this.languageService.isLocalizableEmpty(integrationResource.prefLabel) && integrationResource.localName ?
                integrationResource.uri.toLowerCase() : null))
            .andThen(comparingLocalizable<IntegrationResource>(this.languageService,
              integrationResource => integrationResource.prefLabel ? integrationResource.prefLabel : {})));
        })
      ).subscribe(results => {
      this.searchResults$.next(results);
    });
  }

  selectResource(resource: IntegrationResource) {
    if (!this.selectedResources.includes(resource)) {
      resource.type = this.containerType;
      this.restricts.push(resource.uri);
      this.selectedResources.push(resource);
    }
  }

  removeResource(resource: IntegrationResource) {

    const index: number = this.selectedResources.indexOf(resource);
    if (index !== -1) {
      this.selectedResources.splice(index, 1);
    }
  }

  select() {
    this.modal.close(this.selectedResources);
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

  createEmptyResource() {

    const integrationResourceType: IntegrationResourceType = <IntegrationResourceType>{
      type: this.containerType
    };
    const resource: IntegrationResource = new IntegrationResource(integrationResourceType);
    const resources: IntegrationResource[] = [];
    resources.push(resource);
    this.modal.close(resources);
  }
}

@Injectable()
export class SearchLinkedIntegrationResourceMultiModalService {

  constructor(private modalService: ModalService) {
  }

  open(containerType: string,
       containerUri: string,
       openThreads: boolean | null,
       restrictedResourceUris: string[],
       useUILanguage: boolean = false): Promise<IntegrationResource[]> {

    const modalRef = this.modalService.open(SearchLinkedIntegrationResourceMultiModalComponent, { size: 'lg' });
    const instance = modalRef.componentInstance as SearchLinkedIntegrationResourceMultiModalComponent;
    instance.containerType = containerType;
    instance.containerUri = containerUri;
    instance.openThreads = openThreads;
    instance.restricts = restrictedResourceUris;
    instance.useUILanguage = useUILanguage;
    return modalRef.result;
  }
}