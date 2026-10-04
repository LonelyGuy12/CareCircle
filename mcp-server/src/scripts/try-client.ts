import { ApiError } from '../api/client.js';
import { confirmDose, getDoses, getDueDoses } from '../api/doses.js';

try {
    console.log('All doses:', (await getDoses()).length);

    const due = await getDueDoses();
    console.log(
        'Due doses:',
        due.map((d) => d.medicationName),
    );

    const confirmed = await confirmDose(due[0]!.id, 'alexa');
    console.log('Confirmed:', confirmed.medicationName, confirmed.status, confirmed.confirmedVia);

    await confirmDose('wrong_id', 'alexa');
} catch (err) {
    if (err instanceof ApiError) {
        console.log(`ApiError -> status ${err.status}, code ${err.code}, message: ${err.message}`);
    } else {
        throw err;
    }
}
