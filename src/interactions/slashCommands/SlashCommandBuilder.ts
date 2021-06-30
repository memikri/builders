import type { APIApplicationCommandOption } from 'discord-api-types/v8';
import { mix } from 'ts-mixer';
import { validateMaxOptionsLength, validateRequiredParameters } from './Assertions';
import { SharedNameAndDescription } from './mixins/NameAndDescription';
import { SharedSlashCommandOptions } from './mixins/CommandOptions';
import { SlashCommandSubCommandBuilder, SlashCommandSubCommandGroupBuilder } from './SlashCommandSubCommands';

@mix(SharedSlashCommandOptions, SharedNameAndDescription)
export class SlashCommandBuilder {
	protected name: string = undefined!;

	protected description: string = undefined!;
	protected options: ToAPIApplicationCommandOptions[] = [];

	/**
	 * Returns the final data that should be sent to Discord. You won't need this unless you're manually
	 * creating slash commands via this builder.
	 *
	 * **Note:** Calling this getter will validate required properties based on their conditions.
	 */
	public toJSON() {
		validateRequiredParameters(this.name, this.description, this.options);
		return {
			name: this.name,
			description: this.description,
			options: this.options.map((option) => option.toJSON()),
		};
	}

	/**
	 * Adds a new sub command group to this command
	 * @param input A function that returns a sub command group builder, or an already built builder
	 */
	public addSubCommandGroup(
		input:
			| SlashCommandSubCommandGroupBuilder
			| ((subCommandGroup: SlashCommandSubCommandGroupBuilder) => SlashCommandSubCommandGroupBuilder),
	): SlashCommandSubCommandGroupsOnlyBuilder {
		const { options } = this;

		// First, assert options conditions - we cannot have more than 25 options
		validateMaxOptionsLength(options);

		// Make sure there is no sub command at the root level - if there is, throw
		const hasSubCommands = options.some((item) => item instanceof SlashCommandSubCommandBuilder);
		if (hasSubCommands) throw new RangeError(`You cannot mix sub commands and sub command groups at the root level.`);

		// Get the final result
		const result = typeof input === 'function' ? input(new SlashCommandSubCommandGroupBuilder()) : input;

		if (!(result instanceof SlashCommandSubCommandGroupBuilder))
			throw new TypeError(
				`Expected to receive a SlashCommandSubCommandGroupBuilder back, got ${
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					((result as any)?.name as string) ?? 'Unknown'
				} ("${typeof result}") instead`,
			);

		// Push it
		options.push(result);

		return this;
	}

	/**
	 * Adds a new sub command to this command
	 * @param input A function that returns a sub command builder, or an already built builder
	 */
	public addSubCommand(
		input:
			| SlashCommandSubCommandBuilder
			| ((subCommandGroup: SlashCommandSubCommandBuilder) => SlashCommandSubCommandBuilder),
	): SlashCommandSubCommandsOnlyBuilder {
		const { options } = this;

		// First, assert options conditions - we cannot have more than 25 options
		validateMaxOptionsLength(options);

		// Make sure there is no sub command at the root level - if there is, throw
		const hasSubCommandGroups = options.some((item) => item instanceof SlashCommandSubCommandGroupBuilder);
		if (hasSubCommandGroups)
			throw new RangeError(`You cannot mix sub commands and sub command groups at the root level.`);

		// Get the final result
		const result = typeof input === 'function' ? input(new SlashCommandSubCommandBuilder()) : input;

		if (!(result instanceof SlashCommandSubCommandBuilder))
			throw new TypeError(
				`Expected to receive a SlashCommandSubCommandBuilder back, got ${
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					((result as any)?.name as string) ?? 'Unknown'
				} ("${typeof result}") instead`,
			);

		// Push it
		options.push(result);

		return this;
	}
}

export interface SlashCommandBuilder extends SharedNameAndDescription, SharedSlashCommandOptions {}

export interface SlashCommandSubCommandsOnlyBuilder
	extends SharedNameAndDescription,
		Pick<SlashCommandBuilder, 'toJSON' | 'addSubCommand'> {}

export interface SlashCommandSubCommandGroupsOnlyBuilder
	extends SharedNameAndDescription,
		Pick<SlashCommandBuilder, 'toJSON' | 'addSubCommandGroup'> {}

export interface SlashCommandOptionsOnlyBuilder
	extends SharedNameAndDescription,
		SharedSlashCommandOptions,
		Pick<SlashCommandBuilder, 'toJSON'> {}

export interface ToAPIApplicationCommandOptions {
	toJSON(): APIApplicationCommandOption;
}
