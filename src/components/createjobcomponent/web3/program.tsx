// anchor.ts
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';
import idl from './idl.json'; // Import your IDL file
import { Idl } from '@project-serum/anchor';

const { SystemProgram, Keypair, PublicKey } = web3;

// Replace with your program ID
const programID = new PublicKey("6M18Rahd9HKnzK7c7fk6zXASgZYjPnGwaivQsRRJGb1h");

// Create the provider
const getProvider = (): AnchorProvider => {
  const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
  const wallet = (window as any).solana; // Phantom wallet
  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: 'confirmed',
  });
  return provider;
};

// Initialize the program
const getProgram = (): Program<Idl> => {
  const provider = getProvider();
  const program = new Program(idl as Idl, programID, provider);
  return program;
};

export { getProgram, SystemProgram, Keypair, PublicKey };