import { APIApplicationCommandOptionChoice, ApplicationCommandOptionType } from 'discord-api-types/v8';
import ow from 'ow';
import {
	validateDescription,
	validateMaxChoicesLength,
	validateMaxOptionsLength,
	validateName,
	validateRequiredParameters,
} from './Assertions';
import type { SlashCommandOptionsOnlyBuilder, ToAPIApplicationCommandOptions } from './SlashCommandBuilder';

// #region Mixins

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
					// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
					((result as any)?.name as string) ?? 'Unknown'
				} ("${typeof result}") instead`,
			);

		// Push it
		options.push(result);

		return this as any;
	}
}

export class SharedNameAndDescription {
	protected name!: string;
	protected description!: string;

	/**
	 * Sets the name
	 * @param name The name
	 */
	public setName(name: string) {
		// Assert the name matches the conditions
		validateName(name);

		this.name = name;

		return this;
	}

	/**
	 * Sets the description
	 * @param description The description
	 */
	public setDescription(description: string) {
		// Assert the description matches the conditions
		validateDescription(description);

		this.description = description;

		return this;
	}
}

// #endregion

// #region Basic options

class SlashCommandOptionBase extends SharedNameAndDescription implements ToAPIApplicationCommandOptions {
	protected required = false;

	public constructor(protected type: ApplicationCommandOptionType) {
		super();
	}

	/**
	 * Marks the option as required
	 * @param required If this option should be required
	 */
	public setRequired(required: boolean) {
		// Assert that you actually passed a boolean
		ow(required, 'required', ow.boolean);

		this.required = required;

		return this;
	}

	public toJSON() {
		validateRequiredParameters(this.name, this.description, []);

		// Assert that you actually passed a boolean
		ow(this.required, 'required', ow.boolean);

		return {
			type: this.type,
			name: this.name,
			description: this.description,
			required: this.required,
		};
	}
}

// #endregion

// #region Options with choices

abstract class ApplicationCommandOptionWithChoicesBase<T extends string | number>
	extends SlashCommandOptionBase
	implements ToAPIApplicationCommandOptions
{
	protected choices?: APIApplicationCommandOptionChoice[];

	/**
	 * Adds a choice for this option
	 * @param name The name of the choice
	 * @param value The value of the choice
	 */
	public addChoice(name: string, value: T) {
		if (typeof this.choices === 'undefined') this.choices = [];

		validateMaxChoicesLength(this.choices);

		// Validate name
		ow(
			name,
			`${this.type === ApplicationCommandOptionType.STRING ? 'string' : 'integer'} choice name`,
			ow.string.minLength(1).maxLength(100),
		);

		// Validate the value
		if (this.type === ApplicationCommandOptionType.STRING) ow(value, 'string choice value', ow.string.maxLength(100));
		else ow(value, 'integer choice value', ow.number.finite);

		this.choices.push({ name, value });

		return this;
	}

	/**
	 * Adds multiple choices for this option
	 * @param choices The choices to add
	 */
	public addChoices(choices: Record<T, string> | Map<string, T> | [name: string, value: T][]) {
		const finalOptions =
			Array.isArray(choices) || choices instanceof Map
				? choices
				: (Object.entries(choices).map(([k, v]) => [v, k]) as [name: string, value: T][]);

		for (const [name, value] of finalOptions) this.addChoice(name, value);

		return this;
	}

	public override toJSON() {
		return {
			...super.toJSON(),
			choices: this.choices,
		};
	}
}

// #endregion

// #region Aliases

export class SlashCommandStringOption extends ApplicationCommandOptionWithChoicesBase<string> {
	protected override type = ApplicationCommandOptionType.STRING as const;

	public constructor() {
		super(ApplicationCommandOptionType.STRING);
	}
}

export class SlashCommandIntegerOption extends ApplicationCommandOptionWithChoicesBase<number> {
	protected override type = ApplicationCommandOptionType.INTEGER as const;

	public constructor() {
		super(ApplicationCommandOptionType.INTEGER);
	}
}

export class SlashCommandBooleanOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.BOOLEAN as const;

	public constructor() {
		super(ApplicationCommandOptionType.BOOLEAN);
	}
}

export class SlashCommandUserOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.USER as const;

	public constructor() {
		super(ApplicationCommandOptionType.USER);
	}
}
export class SlashCommandChannelOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.CHANNEL as const;

	public constructor() {
		super(ApplicationCommandOptionType.CHANNEL);
	}
}
export class SlashCommandRoleOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.ROLE as const;

	public constructor() {
		super(ApplicationCommandOptionType.ROLE);
	}
}
export class SlashCommandMentionableOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.MENTIONABLE as const;

	public constructor() {
		super(ApplicationCommandOptionType.MENTIONABLE);
	}
}

// #endregion
