import argparse
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
    TextDataset,
    DataCollatorForLanguageModeling,
)

parser = argparse.ArgumentParser()
parser.add_argument('--model', required=True)
parser.add_argument('--data', required=True)
parser.add_argument('--output', default='finetuned')
args = parser.parse_args()

tokenizer = AutoTokenizer.from_pretrained(args.model)
model = AutoModelForCausalLM.from_pretrained(args.model)

dataset = TextDataset(tokenizer=tokenizer, file_path=args.data, block_size=128)
collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

training_args = TrainingArguments(
    output_dir=args.output,
    overwrite_output_dir=True,
    num_train_epochs=1,
    per_device_train_batch_size=1,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset,
    data_collator=collator,
)

trainer.train()
model.save_pretrained(args.output)
tokenizer.save_pretrained(args.output)
