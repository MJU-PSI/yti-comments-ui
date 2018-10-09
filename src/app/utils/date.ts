import * as moment from 'moment';
import { Moment } from 'moment';
import { FormControl } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';

export interface DateRange {
  start: Moment | null;
  end: Moment | null;
}

export function assertValid(value: Moment): Moment {
  if (value.isValid()) {
    return value;
  } else {
    throw new Error('Not a valid moment object');
  }
}

const dateFormat = 'YYYY-MM-DD';
const dateTimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';
const displayDateFormat = 'DD.MM.YYYY';
const displayDateTimeFormat = 'DD.MM.YYYY HH:mm';

export function toPickerDate(date: Moment | null): NgbDate | null {

  if (!date) {
    return null;
  }

  return new NgbDate(date.year(), date.month() + 1, date.date());
}

export function fromPickerDate(date: NgbDate | null): Moment | null {

  if (date == null) {
    return null;
  }

  return parseDate(`${date.year}-${date.month}-${date.day}`);
}

export function formatDisplayDateTime(dateTime: Moment | null): string {
  return dateTime ? dateTime.format(displayDateTimeFormat) : '-';
}

export function parseDateTime(dateTime: string): Moment {
  return assertValid(moment(dateTime, dateTimeFormat));
}

export function formatDateTime(dateTime: Moment | null): string | undefined {
  return dateTime ? dateTime.format(dateTimeFormat) : undefined;
}

export function parseDate(dateStr: string): Moment {
  return assertValid(moment(dateStr, dateFormat));
}

export function formatDate(date: Moment | null): string {
  return date ? date.format(dateFormat) : '';
}

export function formatDisplayDate(date: Moment | null): string {
  return date ? date.format(displayDateFormat) : '';
}

export function validDate(control: FormControl) {
  return control.value !== undefined ? null : {
    invalidDate: {
      valid: false
    }
  };
}

export function validDateRange(control: FormControl) {

  return control.value !== undefined ? null : {
    invalidDateRange: {
      valid: false
    }
  };
}

export function formatDisplayDateRange(start: Moment | null, end: Moment | null) {
  const formattedStart = formatDisplayDate(start);
  const formattedEnd = formatDisplayDate(end);
  return (formattedStart || formattedEnd) ? formattedStart + ' - ' + formattedEnd : '';
}
