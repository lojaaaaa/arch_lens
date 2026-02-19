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
