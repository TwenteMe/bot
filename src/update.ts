import { cachedJson } from "./helpers/fetch";
import { generateEmailRecords } from "./helpers/emails";
import { getEmailRecordsDelta, getCnameRecordsDelta } from "./helpers/records";
import {
  getDnsRecords,
  addEmailRecord,
  addCnameRecord,
  removeDnsRecord
} from "./helpers/cloudflare";

export const update = async () => {
  const emails: {
    [index: string]: string | string[];
  } = await cachedJson(
    "https://raw.githubusercontent.com/TwenteMe/data/master/emails.json"
  );
  const emailRecords = generateEmailRecords(emails);

  const cname: {
    [index: string]: string;
  } = await cachedJson(
    "https://raw.githubusercontent.com/TwenteMe/data/master/cname.json"
  );

  const dnsRecords = await getDnsRecords();

  const emailRecordsDelta = getEmailRecordsDelta(
    dnsRecords.emailRecords,
    emailRecords
  );
  for await (const record of emailRecordsDelta.recordsToRemove)
    await removeDnsRecord(record);
  for await (const record of emailRecordsDelta.recordsToAdd)
    await addEmailRecord(record);

  const cnameRecordsDelta = getCnameRecordsDelta(
    dnsRecords.cnameRecords,
    cname
  );
  for await (const record of cnameRecordsDelta.recordsToRemove)
    await removeDnsRecord(record);
  for await (const record of cnameRecordsDelta.recordsToAdd)
    await addCnameRecord(record);

  return { emailRecordsDelta, cnameRecordsDelta };
};
