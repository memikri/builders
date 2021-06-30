import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { mix } from 'ts-mixer';
import { validateMaxOptionsLength, validateRequiredParameters } from './Assertions';
import type { ToAPIApplicationCommandOptions } from './SlashCommandBuilder';
import { SharedNameAndDescription, SharedSlashCommandOptions } from './SlashCommandOptions';

/**
 * Represents a folder for sub commands
 *
 * For more information, go to https://discord.com/developers/docs/interactions/slash-commands#subcommands-and-subcommand-groups
 */
export class SlashCommandSubCommandGroupBuilder
	extends SharedNameAndDescription
	implements ToAPIApplicationCommandOptions
{
	private readonly options: ToAPIApplicationCommandOptions[] = [];

	/**
	 * Adds a new sub command to this group
	 * @param input A function that returns a sub command builder, or an already built builder
	 */
	public addSubCommand(
		input:
			| SlashCommandSubCommandBuilder
			| ((subCommandGroup: SlashCommandSubCommandBuilder) => SlashCommandSubCommandBuilder),
	) {
		const { options } = this;

		// First, assert options conditions - we cannot have more than 25 options
		validateMaxOptionsLength(options);

		// Get the final result
		const result = typeof input === 'function' ? input(new SlashCommandSubCommandBuilder()) : input;

		if (!(result instanceof SlashCommandSubCommandBuilder))
			throw new TypeError(
				`Expected to receive a SlashCommandSubCommandBuilder back, got ${
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					((result as any)?.name as string) ?? 'Unknown'
				} ("${typeof result}") instead"`,
			);

		// Push it
		options.push(result);

		return this;
	}

	public toJSON() {
		validateRequiredParameters(this.name, this.description, this.options);
		return {
			type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
			name: this.name,
			description: this.description,
			options: this.options.map((option) => option.toJSON()),
		};
	}
}

/**
 * Represents a sub command
 *
 * For more information, go to https://discord.com/developers/docs/interactions/slash-commands#subcommands-and-subcommand-groups
 */
@mix(SharedSlashCommandOptions, SharedNameAndDescription)
export class SlashCommandSubCommandBuilder implements ToAPIApplicationCommandOptions {
	protected name: string = undefined!;
	protected description: string = undefined!;
	protected options: ToAPIApplicationCommandOptions[] = [];

	public toJSON() {
		validateRequiredParameters(this.name, this.description, this.options);
		return {
			type: ApplicationCommandOptionType.SUB_COMMAND,
			name: this.name,
			description: this.description,
			options: this.options.map((option) => option.toJSON()),
		};
	}
}

export interface SlashCommandSubCommandBuilder
	extends SharedNameAndDescription,
		SharedSlashCommandOptions<SlashCommandSubCommandBuilder> {}
