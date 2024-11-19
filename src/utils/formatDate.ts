import moment from 'moment';

const YYYY_MMMM_DD = (dateStr: string) => moment(dateStr).format('YYYY, MMMM DD');

const YYYY_MMMM_DD_Time = (dateStr: string) => moment(dateStr).format('YYYY MMMM DD, HH:mm');

const DD_MM_YYYY = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY');

const YYYY_YYYY = (startYear: string, endYear: string) => `${moment(startYear).format('YYYY')}-${moment(endYear).format('YYYY')}`;

const DD_MM_YYYY_Time = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY, HH:mm');

const HH_mm = (dateStr: string) => moment(dateStr).format('HH:mm');

export const formatDate = {
    YYYY_MMMM_DD,
    YYYY_MMMM_DD_Time,
    DD_MM_YYYY,
    YYYY_YYYY,
    DD_MM_YYYY_Time,
    HH_mm
}