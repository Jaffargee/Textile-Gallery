import { AlbumProps, ImageProps } from "@/types";

export default class BatchProcessor {

      private items: AlbumProps[] | ImageProps[];
      private batchSize: number;
      private currentBatch: number;

      constructor(items: AlbumProps[] | ImageProps[], batchSize: number = 5) {
            this.items = items;
            this.batchSize = batchSize;
            this.currentBatch = 0;
      }

      getCurrentBatch(): number {
            return this.currentBatch;
      }

      getBatchSize() {
            return this.batchSize;
      }

      getBatches<T>(items: T[]): T[][] {
            const batches: T[][] = [];
            for (let i = 0; i < items.length; i += this.batchSize) {
                  batches.push(items.slice(i, i + this.batchSize));
            }
            return batches;
      }

      getBatchCount<T>(items: T[]): number {
            return Math.ceil(items.length / this.batchSize);
      }

      getBatch(items: AlbumProps[] | ImageProps[], batchIndex: number): AlbumProps[] | ImageProps[] {
            const start = batchIndex * this.batchSize;
            return items.slice(start, start + this.batchSize);
      }

      async processInBatches(processBatch: (batch: AlbumProps[] | ImageProps[], index?: number) => Promise<void>): Promise<void> {
            for (let i = 0; i < this.items.length; i += this.batchSize) {
                  const batch = this.getBatch(this.items, i / this.batchSize);
                  await processBatch(batch, i);
                  this.currentBatch++;
            }
      }
}

export class MapBatchProcessor<K, V> {

      private items: Map<K, V>;
      private batchSize: number;
      private currentBatch: number;

      constructor(items: Map<K, V>, batchSize: number = 5) {
            this.items = items;
            this.batchSize = batchSize;
            this.currentBatch = 0;
      }

      getBatchSize() {
            return this.batchSize;
      }

      getBatches(): Map<K, V>[] {
            const batches: Map<K, V>[] = [];
            const entries = Array.from(this.items.entries());
            for (let i = 0; i < entries.length; i += this.batchSize) {
                  const batchEntries = entries.slice(i, i + this.batchSize);
                  batches.push(new Map(batchEntries));
            }
            return batches;
      }

      getBatchCount(): number {
            return Math.ceil(this.items.size / this.batchSize);
      }

      getBatch(batchIndex: number): Map<K, V> {
            const start = batchIndex * this.batchSize;
            const entries = Array.from(this.items.entries()).slice(start, start + this.batchSize);
            return new Map(entries);
      }

      async processInBatches(processBatch: (batch: Map<K, V>) => Promise<void>): Promise<void> {
            const entries = Array.from(this.items.entries());
            for (let i = 0; i < entries.length; i += this.batchSize) {
                  const batchEntries = this.getBatch(i / this.batchSize).entries();
                  const batchMap = new Map(batchEntries);
                  await processBatch(batchMap);
                  this.currentBatch++;
            }
      }
}