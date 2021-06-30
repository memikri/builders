import { ApplicationCommandOptionType } from 'discord-api-types/v8';
import { SlashCommandOptionBase } from '../mixins/CommandOptionBase';

export class SlashCommandMentionableOption extends SlashCommandOptionBase {
	protected override type = ApplicationCommandOptionType.MENTIONABLE as const;

	public constructor() {
		super(ApplicationCommandOptionType.MENTIONABLE);
	}
}
