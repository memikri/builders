import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { SlashCommandOptionBase } from '../mixins/CommandOptionBase';

export class SlashCommandBooleanOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.BOOLEAN as const;

	public constructor() {
		super(ApplicationCommandOptionType.BOOLEAN);
	}
}
