# SV.iobio

A structural variant visualization application.

## Development Notes

- VCFs need to be sorted
- VCF needs to have an info field (column #8, zeroIndex 7) that contains 'END' and 'SVTYPE'
- Manta is being used as the base SV caller, a ref caller will be allowed in the future TODO
  - The ref VCF will need to have the same required info fields as the Manta VCF
