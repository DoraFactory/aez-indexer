import { VoteEvent, Message } from '../types';
import {
	CosmosEvent,
	CosmosBlock,
	CosmosMessage,
	CosmosTransaction,
} from '@subql/types-cosmos';

/*
export async function handleBlock(block: CosmosBlock): Promise<void> {
  // If you want to index each block in Cosmos (DoraVota), you could do that here
}

export async function handleTransaction(tx: CosmosTransaction): Promise<void> {
  // If you want to index each transaction in Cosmos (DoraVota), you could do that here
  const transactionRecord = Transaction.create({
    id: tx.hash,
    blockHeight: BigInt(tx.block.block.header.height),
    timestamp: tx.block.block.header.time,
  });
  await transactionRecord.save();
}
*/

const AEZ_CONTRACT = [
	'dora1kwsy422rq89ljgcycfkyvwmc2jvw5pwrqdzwa6gp4xfz6kmshads5ep3e6',
];

export async function handleMessage(msg: CosmosMessage): Promise<void> {
	let contractAddress = msg.msg.decodedMsg.contract;
	if (AEZ_CONTRACT.includes(contractAddress)) {
		logger.info('=================== Message =====================');
		logger.info('=================================================');
		logger.info(`Message ${JSON.stringify(msg.msg.decodedMsg)}`);
		logger.info(`height ${JSON.stringify(msg.block.block.header.height)}`);
		const messageRecord = Message.create({
			id: `${msg.tx.hash}-${msg.idx}`,
			blockHeight: BigInt(msg.block.block.header.height),
			txHash: msg.tx.hash,
			sender: msg.msg.decodedMsg.sender,
			contract: msg.msg.decodedMsg.contract,
		});
		await messageRecord.save();
	}
}

function parseString(input: string): string[] {
	const trimmedInput = input.slice(1, -1);
	if (trimmedInput === '') {
		return [];
	}
	const result = trimmedInput.split(',').map(num => num);
	return result;
}

export async function handleBatchVoteEvent(event: CosmosEvent): Promise<void> {
	logger.info(`-----------------------------------------------------`);
	logger.info(`--------------- batch_vote Event ----------------`);
	logger.info(`-----------------------------------------------------`);
	logger.info(
		`handleBatchVoteEvent ${JSON.stringify(event.event.attributes)}`
	);
	logger.info(`height ${JSON.stringify(event.block.block.header.height)}`);
	let timestamp = event.tx.block.header.time.getTime().toString();

	let contractAddress = event.event.attributes.find(
		attr => attr.key === '_contract_address'
	)?.value!;
	logger.info(`contractAddress: ${contractAddress}`);

	let sender = event.event.attributes.find(attr => attr.key === 'sender')
		?.value!;

	let projects = event.event.attributes.find(attr => attr.key === 'projects')
		?.value!;

	let parseProjects = parseString(projects);

	let amounts = event.event.attributes.find(attr => attr.key === 'amounts')
		?.value!;

	let denom = event.event.attributes.find(attr => attr.key === 'denom')
		?.value!;

	let parseAmounts = parseString(amounts);
	for (let i = 0; i < parseProjects.length; i++) {
		let project = parseProjects[i];
		let amount = parseAmounts[i];

		const eventRecord = VoteEvent.create({
			id: `${event.tx.hash}-${event.msg.idx}-${event.idx}-${i}-${project}`,
			blockHeight: BigInt(event.block.block.header.height),
			timestamp,
			txHash: event.tx.hash,
			contractAddress,
			sender,
			project,
			amount,
			denom,
		});

		await eventRecord.save();
		logger.info(
			`${eventRecord.blockHeight} Save batch_vote event - ${contractAddress} : ${sender} => ${project} ${amount}`
		);
	}
}
