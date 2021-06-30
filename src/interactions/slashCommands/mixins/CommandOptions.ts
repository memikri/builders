import { validateMaxOptionsLength } from '../Assertions';
import type { SlashCommandOptionBase } from './CommandOptionBase';
import { SlashCommandBooleanOption } from '../options/boolean';
import { SlashCommandChannelOption } from '../options/channel';
import { SlashCommandIntegerOption } from '../options/integer';
import { SlashCommandMentionableOption } from '../options/mentionable';
import { SlashCommandRoleOption } from '../options/role';
import { SlashCommandStringOption } from '../options/string';
import { SlashCommandUserOption } from '../options/user';
import type { SlashCommandOptionsOnlyBuilder, ToAPIApplicationCommandOptions } from '../SlashCommandBuilder';

export class SharedSlashCommandOptions<R = SlashCommandOptionsOnlyBuilder> {
	protected options!: ToAPIApplicationCommandOptions[];

	/**
	 * Adds a boolean option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addBooleanOption(
		input: SlashCommandBooleanOption | ((builder: SlashCommandBooleanOption) => SlashCommandBooleanOption),
	) {
		return this._sharedAddOptionMethod(input, SlashCommandBooleanOption);
	}

	/**
	 * Adds a user option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addUserOption(input: SlashCommandUserOption | ((builder: SlashCommandUserOption) => SlashCommandUserOption)) {
		return this._sharedAddOptionMethod(input, SlashCommandUserOption);
	}

	/**
	 * Adds a channel option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addChannelOption(
		input: SlashCommandChannelOption | ((builder: SlashCommandChannelOption) => SlashCommandChannelOption),
	) {
		return this._sharedAddOptionMethod(input, SlashCommandChannelOption);
	}

	/**
	 * Adds a role option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addRoleOption(input: SlashCommandRoleOption | ((builder: SlashCommandRoleOption) => SlashCommandRoleOption)) {
		return this._sharedAddOptionMethod(input, SlashCommandRoleOption);
	}

	/**
	 * Adds a mentionable option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addMentionableOption(
		input: SlashCommandMentionableOption | ((builder: SlashCommandMentionableOption) => SlashCommandMentionableOption),
	) {
		return this._sharedAddOptionMethod(input, SlashCommandMentionableOption);
	}

	/**
	 * Adds a string option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addStringOption(
		input: SlashCommandStringOption | ((builder: SlashCommandStringOption) => SlashCommandStringOption),
	) {
		return this._sharedAddOptionMethod(input, SlashCommandStringOption);
	}

	/**
	 * Adds an integer option
	 * @param input A function that returns an option builder, or an already built builder
	 */
	public addIntegerOption(
		input: SlashCommandIntegerOption | ((builder: SlashCommandIntegerOption) => SlashCommandIntegerOption),
	) {
		return this._sharedAddOptionMethod(input, SlashCommandIntegerOption);
	}

	private _sharedAddOptionMethod<T extends SlashCommandOptionBase>(
		input: T | ((builder: T) => T),
		Instance: new () => T,
	): R {
		const { options } = this;

		// First, assert options conditions - we cannot have more than 25 options
		validateMaxOptionsLength(options);

		// Get the final result
		const result = typeof input === 'function' ? input(new Instance()) : input;

		if (!(result instanceof Instance))
			throw new TypeError(
				`Expected to receive a ${Instance.name} builder back, got ${
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/dot-notation
					(result?.['name'] as string) ?? 'Unknown'
				} ("${typeof result}") instead`,
			);

		// Push it
		options.push(result);

		return this as any;
	}
}
