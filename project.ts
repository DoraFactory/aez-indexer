import {
	CosmosDatasourceKind,
	CosmosHandlerKind,
	CosmosProject,
} from '@subql/types-cosmos';

// Can expand the Datasource processor types via the genreic param
const project: CosmosProject = {
	specVersion: '1.0.0',
	version: '0.0.1',
	name: 'doravota-starter',
	description:
		'This project can be use as a starting point for developing your Cosmos DoraVota based SubQuery project',
	runner: {
		node: {
			name: '@subql/node-cosmos',
			version: '>=3.0.0',
		},
		query: {
			name: '@subql/query',
			version: '*',
		},
	},
	schema: {
		file: './schema.graphql',
	},
	network: {
		/* The unique chainID of the Cosmos Zone */
		chainId: 'vota-ash',
		/**
		 * These endpoint(s) should be public non-pruned archive node
		 * We recommend providing more than one endpoint for improved reliability, performance, and uptime
		 * Public nodes may be rate limited, which can affect indexing speed
		 * When developing your project we suggest getting a private API key
		 * If you use a rate limited endpoint, adjust the --batch-size and --workers parameters
		 * These settings can be found in your docker-compose.yaml, they will slow indexing but prevent your project being rate limited
		 */
		endpoint: ['http://47.128.207.247:26657'],
		// endpoint: ['https://vota-testnet-rpc.dorafactory.org:443'],
	},
	dataSources: [
		{
			kind: CosmosDatasourceKind.Runtime,
			startBlock: 2500400, // 2496001 // mainnet start block
			// startBlock: 4941900,
			// startBlock: 4969400,
			// startBlock: 2533000, // testnet start block
			mapping: {
				file: './dist/index.js',
				handlers: [
					{
						handler: 'handleBatchVoteEvent',
						kind: CosmosHandlerKind.Event,
						filter: {
							type: 'wasm-batch_vote',
							messageFilter: {
								type: '/cosmwasm.wasm.v1.MsgExecuteContract',
								values: {
									contract:
										'dora1kwsy422rq89ljgcycfkyvwmc2jvw5pwrqdzwa6gp4xfz6kmshads5ep3e6', // old contract
								},
							},
						},
					},
					{
						handler: 'handleBatchVoteEvent',
						kind: CosmosHandlerKind.Event,
						filter: {
							type: 'wasm-batch_vote',
							messageFilter: {
								type: '/cosmwasm.wasm.v1.MsgExecuteContract',
								values: {
									contract:
										'dora1s5dw2slwynz90n6gplshury5whsqtdl8aexn9k66cmzfqpk7a6zqyfjrry', // new contract
								},
							},
						},
					},
				],
			},
		},
	],
};

// Must set default to the project instance
export default project;
