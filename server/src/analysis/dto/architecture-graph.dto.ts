import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

const NODE_KINDS = [
  'system',
  'ui_page',
  'ui_component',
  'state_store',
  'api_gateway',
  'service',
  'database',
  'cache',
  'external_system',
] as const;

const EDGE_KINDS = [
  'calls',
  'reads',
  'writes',
  'subscribes',
  'depends_on',
  'emits',
] as const;

const LAYERS = ['frontend', 'backend', 'data'] as const;

export class PositionDto {
  @IsNumber()
  x: number;

  @IsNumber()
  y: number;
}

export class ArchitectureNodeDto {
  @IsString()
  id: string;

  @IsIn(NODE_KINDS)
  kind: string;

  @IsIn(LAYERS)
  layer: string;

  @ValidateNested()
  @Type(() => PositionDto)
  position: PositionDto;

  @IsNumber()
  complexity: number;

  @IsNumber()
  criticality: number;

  // Shared optional — используются в анализе
  @IsOptional()
  @IsString()
  displayName?: string;

  // ui_page
  @IsOptional()
  @IsString()
  route?: string;
  @IsOptional()
  @IsNumber()
  componentsCount?: number;
  @IsOptional()
  @IsString()
  stateUsage?: string;
  @IsOptional()
  @IsNumber()
  updateFrequency?: number;

  // system
  @IsOptional()
  @IsNumber()
  pagesCount?: number;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsNumber()
  targetAvailability?: number;
  @IsOptional()
  @IsNumber()
  targetThroughputRps?: number;
  @IsOptional()
  @IsNumber()
  latencySloMs?: number;
  @IsOptional()
  @IsIn(['monolith', 'microservices', 'hybrid'])
  deploymentModel?: string;

  // ui_component
  @IsOptional()
  @IsString()
  componentType?: string;
  @IsOptional()
  @IsNumber()
  nestedComponents?: number;
  @IsOptional()
  @IsNumber()
  propsCount?: number;
  @IsOptional()
  @IsString()
  stateType?: string;
  @IsOptional()
  @IsNumber()
  renderFrequency?: number;

  // state_store
  @IsOptional()
  @IsString()
  storeType?: string;
  @IsOptional()
  @IsNumber()
  subscribersCount?: number;

  // api_gateway
  @IsOptional()
  @IsNumber()
  endpointsCount?: number;
  @IsOptional()
  @IsNumber()
  requestRate?: number;
  @IsOptional()
  @IsBoolean()
  authRequired?: boolean;

  // service
  @IsOptional()
  @IsNumber()
  operationsCount?: number;
  @IsOptional()
  @IsNumber()
  externalCalls?: number;
  @IsOptional()
  @IsBoolean()
  stateful?: boolean;

  // database
  @IsOptional()
  @IsString()
  dbType?: string;
  @IsOptional()
  @IsNumber()
  tablesCount?: number;
  @IsOptional()
  @IsNumber()
  readWriteRatio?: number;

  // cache
  @IsOptional()
  @IsString()
  cacheType?: string;
  @IsOptional()
  @IsNumber()
  hitRate?: number;

  // external_system
  @IsOptional()
  @IsString()
  systemType?: string;
  @IsOptional()
  @IsString()
  protocol?: string;
  @IsOptional()
  @IsNumber()
  reliability?: number;
  @IsOptional()
  @IsNumber()
  latencyMs?: number;
  @IsOptional()
  @IsNumber()
  rateLimit?: number;

  // override latency/availability для service, database, cache, api_gateway (future)
  @IsOptional()
  @IsNumber()
  availability?: number;
  @IsOptional()
  @IsNumber()
  capacityRps?: number;

  [key: string]: unknown;
}

export class GraphEdgeDto {
  @IsString()
  id: string;

  @IsString()
  source: string;

  @IsString()
  target: string;

  @IsIn(EDGE_KINDS)
  kind: string;

  @IsOptional()
  @IsNumber()
  frequency?: number;

  @IsOptional()
  @IsBoolean()
  synchronous?: boolean;
}

export class GraphMetaDto {
  @IsString()
  name: string;

  @IsNumber()
  version: number;

  @IsString()
  createdAt: string;
}

export class ArchitectureGraphDto {
  @ValidateNested()
  @Type(() => GraphMetaDto)
  meta: GraphMetaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArchitectureNodeDto)
  nodes: ArchitectureNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GraphEdgeDto)
  edges: GraphEdgeDto[];
}
