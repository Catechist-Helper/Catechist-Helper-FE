import moment from 'moment';

export const formatDate_YYYY_MMMM_DD = (dateStr: string) => moment(dateStr).format('YYYY, MMMM DD');

export const formatDate_YYYY_MMMM_DD_Time = (dateStr: string) => moment(dateStr).format('YYYY MMMM DD, HH:mm');

export const formatDate_DD_MM_YYYY = (dateStr: string) => moment(dateStr).format('DD/MM/YYYY');