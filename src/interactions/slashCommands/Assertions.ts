import type { APIApplicationCommandOptionChoice } from 'discord-api-types/v8';
import ow from 'ow';
import type { ToAPIApplicationCommandOptions } from './SlashCommandBuilder';

export function validateRequiredParameters(
	name: string,
	description: string,
	options: ToAPIApplicationCommandOptions[],
) {
	// Assert name matches all conditions
	validateName(name);

	// Assert description conditions
	validateDescription(description);

	// Assert options conditions
	validateMaxOptionsLength(options);
}

export function validateName(name: unknown): asserts name is string {
	ow(name, 'name', ow.string.lowercase.alphabetical.minLength(1).maxLength(32));
}

export function validateDescription(description: unknown): asserts description is string {
	ow(description, 'description', ow.string.minLength(1).maxLength(100));
}

export function validateMaxOptionsLength(options: unknown): asserts options is ToAPIApplicationCommandOptions[] {
	ow(options, 'options', ow.array.maxLength(25));
}

export function validateMaxChoicesLength(choices: APIApplicationCommandOptionChoice[]) {
	ow(choices, 'choices', ow.array.maxLength(25));
}
